import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { toaster } from '$components/Toaster';
import { FormikHelpers } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollection } from '@developmentseed/stac-react';
import { StacCollection } from 'stac-ts';

import Api, { STAC_API_URL, useApi } from '../../api';
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

  const navigate = useNavigate();
  const api = useApi();
  const [notifications, setNotifications] = useState<
    AppNotification[] | undefined
  >();

  const onSubmit = async (data: any, formikHelpers: FormikHelpers<any>) => {
    try {
      toaster.dismiss();
      setNotifications(undefined);
      toaster.create({
        id: 'collection-submit',
        title: 'Creating collection...',
        type: 'loading',
        duration: Number.POSITIVE_INFINITY
      });

      await collectionTransaction(api).create(data);

      toaster.update('collection-submit', {
        title: 'Collection created',
        type: 'success',
        duration: 5000,
        closable: true
      });

      navigate(`/collections/${data.id}`);
    } catch (error: any) {
      toaster.dismiss('collection-submit');
      setNotifications(parseResponseForNotifications(error));
    }
    formikHelpers.setSubmitting(false);
  };

  return <EditForm onSubmit={onSubmit} notifications={notifications} />;
}

export function CollectionFormEdit(props: { id: string }) {
  const { id } = props;
  const { collection, isLoading, error } = useCollection(id);
  const api = useApi();
  const [triedLoading, setTriedLoading] = useState(!!collection);
  const [notifications, setNotifications] = useState<
    AppNotification[] | undefined
  >();

  usePageTitle(collection ? `Edit collection ${id}` : 'Edit collection');

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      setTriedLoading(true);
    }
  }, [isLoading]);

  if (isLoading || !triedLoading) {
    return <Box>Loading collection...</Box>;
  }

  if (error) {
    return (
      <Box>
        Error loading collection:{' '}
        {typeof error.detail === 'string'
          ? error.detail
          : JSON.stringify(error.detail)}
      </Box>
    );
  }

  const onSubmit = async (data: any, formikHelpers: FormikHelpers<any>) => {
    try {
      toaster.dismiss();
      setNotifications(undefined);
      toaster.create({
        id: 'collection-submit',
        title: 'Updating collection...',
        type: 'loading',
        duration: Number.POSITIVE_INFINITY
      });
      await collectionTransaction(api).update(id, data);

      toaster.update('collection-submit', {
        title: 'Collection updated',
        type: 'success',
        duration: 5000,
        closable: true
      });

      navigate(`/collections/${data.id}`);
    } catch (error: any) {
      toaster.dismiss('collection-submit');
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

function collectionTransaction(api: Api): collectionTransactionType {
  const createRequest = async (
    url: string,
    method: string,
    data: StacCollection
  ) => {
    return api.fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  };

  return {
    update: (id: string, data: StacCollection) =>
      createRequest(`${STAC_API_URL}/collections/${id}`, 'PUT', data),
    create: (data: StacCollection) =>
      createRequest(`${STAC_API_URL}/collections/`, 'POST', data)
  };
}
