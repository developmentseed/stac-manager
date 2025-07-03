import React, { useEffect, useState } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { FormikHelpers } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollection } from '@developmentseed/stac-react';
import { StacCollection } from 'stac-ts';

import Api from '../../api';
import { useKeycloak } from '../../auth/Context';
import { EditForm } from './EditForm';
import usePageTitle from '$hooks/usePageTitle';
import {
  AppNotification,
  parseResponseForNotifications
} from '$components/Notifications';

export function CollectionForm() {
  const { collectionId } = useParams();

  return collectionId ? (
    <CollectionFormEdit id={collectionId} />
  ) : (
    <CollectionFormNew />
  );
}

export function CollectionFormNew() {
  usePageTitle('New collection');

  const toast = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<
    AppNotification[] | undefined
  >();

  const { keycloak } = useKeycloak();

  const onSubmit = async (data: any, formikHelpers: FormikHelpers<any>) => {
    try {
      toast.closeAll();
      setNotifications(undefined);
      toast({
        id: 'collection-submit',
        title: 'Creating collection...',
        status: 'loading',
        duration: null,
        position: 'bottom-right'
      });

      await collectionTransaction(keycloak?.token).create(data);

      toast.update('collection-submit', {
        title: 'Collection created',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      navigate(`/collections/${data.id}`);
    } catch (error: any) {
      toast.close('collection-submit');
      setNotifications(parseResponseForNotifications(error));
    }
    formikHelpers.setSubmitting(false);
  };

  return <EditForm onSubmit={onSubmit} notifications={notifications} />;
}

export function CollectionFormEdit(props: { id: string }) {
  const { id } = props;
  const { collection, state, error } = useCollection(id);
  const [triedLoading, setTriedLoading] = useState(!!collection);
  const [notifications, setNotifications] = useState<
    AppNotification[] | undefined
  >();

  usePageTitle(collection ? `Edit collection ${id}` : 'Edit collection');

  const navigate = useNavigate();

  const toast = useToast();

  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (state === 'LOADING') {
      setTriedLoading(true);
    }
  }, [state]);

  if (state === 'LOADING' || !triedLoading) {
    return <Box>Loading collection...</Box>;
  }

  if (error) {
    return <Box>Error loading collection: {error.detail}</Box>;
  }

  const onSubmit = async (data: any, formikHelpers: FormikHelpers<any>) => {
    try {
      toast.closeAll();
      setNotifications(undefined);
      toast({
        id: 'collection-submit',
        title: 'Updating collection...',
        status: 'loading',
        duration: null,
        position: 'bottom-right'
      });
      await collectionTransaction(keycloak?.token).update(id, data);

      toast.update('collection-submit', {
        title: 'Collection updated',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      navigate(`/collections/${data.id}`);
    } catch (error: any) {
      toast.close('collection-submit');
      setNotifications(parseResponseForNotifications(error));
    }
    formikHelpers.setSubmitting(false);
  };

  return (
    <EditForm
      onSubmit={onSubmit}
      initialData={collection}
      notifications={notifications}
    />
  );
}

type collectionTransactionType = {
  update: (id: string, data: StacCollection) => Promise<StacCollection>;
  create: (data: StacCollection) => Promise<StacCollection>;
};

function collectionTransaction(token?: string): collectionTransactionType {
  const createRequest = async (
    url: string,
    method: string,
    data: StacCollection
  ) => {
    return Api.fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined
      },
      body: JSON.stringify(data)
    });
  };

  return {
    update: (id: string, data: StacCollection) =>
      createRequest(
        `${process.env.REACT_APP_STAC_API}/collections/${id}`,
        'PUT',
        data
      ),
    create: (data: StacCollection) =>
      createRequest(
        `${process.env.REACT_APP_STAC_API}/collections/`,
        'POST',
        data
      )
  };
}
