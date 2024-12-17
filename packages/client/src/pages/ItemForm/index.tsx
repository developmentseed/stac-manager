import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Box, Heading, Button, Text, Table, Thead, Tr, Th, Tbody, Td, Input, IconButton, RadioGroup, Stack, Radio } from "@chakra-ui/react";
import { useItem } from "@developmentseed/stac-react";
import { MdAdd, MdDelete } from "react-icons/md";
import { StacItem } from "stac-ts";

import { FormValues } from "./types";
import { HeadingLead, Loading } from "../../components";
import useUpdateItem from "./useUpdateItem";
import { usePageTitle } from "../../hooks";
import { TextInput, TextAreaInput, NumberInput, ArrayInput, CheckboxField, DateTimeInput } from "../../components/forms";

function ItemForm () {
  const { collectionId, itemId } = useParams();
  usePageTitle(`Edit item ${itemId}`);
  const itemResource = `${process.env.REACT_APP_STAC_API}/collections/${collectionId}/items/${itemId}`;
  const { item, state, reload } = useItem(itemResource);
  const { update, state: updateState } = useUpdateItem(itemResource);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<FormValues>({ values: item });
  
  const {
    fields,
    append,
    remove
  } = useFieldArray({ control, name: "properties.providers" });
  const onSubmit = (data: StacItem) => update(data).then(reload);
  
  const [ dateType, setDateType ] = useState<string>();

  useEffect(() => {
    if (!item) return;

    const { start_datetime, end_datetime, datetime } = item.properties;
    if (start_datetime && end_datetime) {
      setDateType("range");
      setValue("properties.start_datetime", start_datetime.split("Z")[0]);
      setValue("properties.end_datetime", end_datetime.split("Z")[0]);
    } else {
      setDateType("single");
      setValue("properties.datetime", datetime.split("Z")[0]);
    }
  }, [item, setValue]);

  const handleRangeUpdate = (v?: string) => {
    if (v) {
      setValue("properties.datetime", null);
    }
    return `${v}Z`;
  };

  const handleSingleDateUpdate = (v?: string) => {
    if (v) {
      setValue("properties.start_datetime", undefined);
      setValue("properties.end_datetime", undefined);
      return `${v}Z`;
    }
    return null;
  };

  if (!item || state === "LOADING") {
    return <Loading>Loading item...</Loading>;
  }

  return (
    <>
      <Heading as="h1">
        <HeadingLead>Edit Item</HeadingLead> {item.id}
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text as="h2">Common Meta Data</Text>
        <TextInput
          label="Title"
          error={errors.properties?.title}
          {...register("properties.title")}
        />
        <TextAreaInput
          label="Description"
          error={errors.properties?.description}
          {...register("properties.description")}
        />
        <TextInput
          label="License"
          error={errors.properties?.license}
          {...register("properties.license")}
        />

        <fieldset>
          <legend>Date</legend>
          <RadioGroup onChange={setDateType} value={dateType}>
            <Stack direction="row">
              <Radio value="single">Single date</Radio>
              <Radio value="range">Date range</Radio>
            </Stack>
          </RadioGroup>
          <Box
            aria-hidden={dateType !== "single"}
            display={dateType === "single" ? "block" : "none"}
          >
            <DateTimeInput  
              label="Enter date"
              error={errors.properties?.datetime}
              {...register("properties.datetime", {
                setValueAs: handleSingleDateUpdate
              })}
            />
          </Box>
          <Box
            aria-hidden={dateType === "single"}
            display={dateType !== "single" ? "flex" : "none"}
            gap="4"
          >
            <DateTimeInput
              label="Date/time from"
              error={errors.properties?.start_datetime}
              {...register("properties.start_datetime", {
                setValueAs: handleRangeUpdate
              })}
            />
            <DateTimeInput
              label="Date/time to"
              error={errors.properties?.end_datetime}
              {...register("properties.end_datetime", {
                setValueAs: handleRangeUpdate
              })}
            />
          </Box>
        </fieldset>

        <fieldset>
          <legend>Providers</legend>

          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th id="provider_name">Name</Th>
                <Th id="provider_description">Description</Th>
                <Th id="provider_roles">Roles</Th>
                <Th id="provider_url">URL</Th>
                <Th aria-label="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {fields.map(({ id }, idx: number) => (
                <Tr key={id}>
                  <Td>
                    <Input
                      {...register(`properties.providers.${idx}.name`)}
                      aria-labelledby="provider_name"
                    />
                  </Td>
                  <Td>
                    <Input
                      {...register(`properties.providers.${idx}.description`)}
                      aria-labelledby="provider_description"
                    />
                  </Td>
                  <Td>
                    <Controller
                      name={`properties.providers.${idx}.roles`}
                      render={({ field }) => (
                        <CheckboxField
                          aria-labelledby="provider_roles"
                          options={[
                            { value: "licensor", label: "Licensor" },
                            { value: "producer", label: "Producer" },
                            { value: "processor", label: "Processor" },
                            { value: "host", label: "Host"}
                          ]}
                          {...field}
                        />
                      )}
                      control={control}
                    />
                  </Td>
                  <Td>
                    <Input
                      {...register(`properties.providers.${idx}.url`)}
                      aria-labelledby="provider_url"
                    />
                  </Td>
                  <Td>
                    <IconButton
                      type="button"
                      size="sm"
                      icon={<MdDelete />}
                      onClick={() => remove(idx)}
                      aria-label="Remove provider"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Box textAlign="right" mt="2">
            <Button
              type="button"
              variant="link"
              leftIcon={<MdAdd />}
              onClick={() => append({ name: "" })}
            >
              Add provider
            </Button>
          </Box>
        </fieldset>

        <Text as="h2">Instruments</Text>
        <TextInput
          label="Platform"
          error={errors.properties?.platform}
          {...register("properties.platform")}
        />
        <Controller
          name="properties.instrument"
          render={({ field }) => (
            <ArrayInput
              label="Instrument"
              error={errors.properties?.instrument}
              helper="Enter a comma-separated list of sensors used in the creation of the data."
              {...field}
            />
          )}
          control={control}
        />
        <TextInput
          label="Constellation"
          error={errors.properties?.constellation}
          {...register("properties.constellation")}
        />
        <TextInput
          label="Mission"
          error={errors.properties?.mission}
          {...register("properties.mission")}
        />
        <NumberInput
          label="Ground Sample Distance"
          error={errors.properties?.gsd}
          {...register("properties.gsd", { min: 0 })}
        />

        <Box mt="4">
          <Button type="submit" isLoading={updateState === "LOADING"}>Save item</Button>
        </Box>
      </form>
    </>
  );
}

export default ItemForm;
