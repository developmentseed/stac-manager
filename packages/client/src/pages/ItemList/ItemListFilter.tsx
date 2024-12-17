import { useState, useRef, useCallback } from "react";
import { Box, Button, Icon, IconButton, Text, useDisclosure } from "@chakra-ui/react";
import { MdChevronRight, MdDelete, MdExpandMore } from "react-icons/md";
import { useCollections } from "@developmentseed/stac-react";
import Map, { type MapRef, Source, Layer } from "react-map-gl/maplibre";
import { StacCollection } from "stac-ts";
import "maplibre-gl/dist/maplibre-gl.css";

import { ArrayInput, DateRangeInput, SelectInput } from "../../components/forms";
import DrawBboxControl from "./DrawBboxControl";

type ItemListFilterProps = {
  ids?: string[]
  setIds: (ids: string[]) => void
  bbox?: number[];
  setBbox: (bbox?: number[]) => void;
  collections?: string[];
  setCollections: (collections?: string[]) => void;
  dateRangeFrom?: string;
  setDateRangeFrom: (date: string) => void;
  dateRangeTo?: string;
  setDateRangeTo: (date: string) => void;
  submit: () => void;
}

function ItemListFilter({
  ids,
  setIds,
  bbox,
  setBbox,
  collections: selectedCollections,
  setCollections,
  dateRangeFrom,
  setDateRangeFrom,
  dateRangeTo,
  setDateRangeTo,
  submit
}: ItemListFilterProps) {
  const { collections } = useCollections();

  // Filter form states and hooks
  const { isOpen, onClose, getDisclosureProps, getButtonProps } = useDisclosure();
  const buttonProps = getButtonProps();
  const disclosureProps = getDisclosureProps();
  const [ buttonLabel, setButtonLabel ] = useState("Filter items");

  const handleSelectCollection: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setCollections(event.target.value ? [ event.target.value ] : undefined);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    submit();
    onClose();

    const numberOfFilters = [
      ids?.length,
      selectedCollections?.length,
      bbox,
      dateRangeFrom || dateRangeTo
    ].filter(x => !!x).length;
    
    setButtonLabel(numberOfFilters > 0 ? `${numberOfFilters} filter${numberOfFilters > 1 ? "s" : ""} applied` : "Filter items");
  };

  // Date range state and handlers
  const dateRangeFromValue = dateRangeFrom?.split("T")[0];
  const handleDateRangeFrom = (value: string) => setDateRangeFrom(value ? `${value}T00:00:00Z` : "");
  const dateRangeToValue = dateRangeTo?.split("T")[0];
  const handleDateRangeTo = (value: string) => setDateRangeTo(value ? `${value}T00:00:00Z` : "");
  const rangeError = (!!dateRangeTo && !!dateRangeFrom) && dateRangeFrom >= dateRangeTo;

  // BBox state and handlers
  const mapRef = useRef() as React.MutableRefObject<MapRef>;
  const [ isDrawing, setIsDrawing ] = useState(false);
  const handleDrawComplete = useCallback((bbox: number[]) => {
    setIsDrawing(false);
    setBbox(bbox);
  }, [setBbox]);

  return (
    <Box
      borderRadius="5px"
      border="2px dashed"
      borderColor="gray.300"
      mb="4"
      px="4"
      py="2"
    >
      <Button
        size="sm"
        variant="link"
        {...buttonProps}
        display="flex"
        alignItems="center"
      >
        <Icon as={isOpen ? MdExpandMore : MdChevronRight} boxSize="4" />
        <span>{ buttonLabel }</span>
      </Button>
      <Box
        as="form"
        onSubmit={handleSubmit}
        display="grid"
        gap="4"
        mb="2"
        gridTemplateColumns="1fr 1fr"
        {...disclosureProps}
      >
        <Box>
          <ArrayInput
            label="Item IDs"
            onChange={setIds}
            helper="Enter a comma-separated list of item IDs you want to match."
          />
          <SelectInput label="Collection" onChange={handleSelectCollection}>
            <option value="" />
            { collections?.collections.map(({ id }: StacCollection) => (
              <option key={id} value={id}>{ id }</option>
            ))}
          </SelectInput>
          <DateRangeInput
            label="Date range"
            dateRangeFrom={dateRangeFromValue}
            setDateRangeFrom={handleDateRangeFrom}
            dateRangeTo={dateRangeToValue}
            setDateRangeTo={handleDateRangeTo}
            error={rangeError ? { message: "The to-date must be later than the from-date." } : undefined}
          />
        </Box>
        <Box display="grid" gridTemplateRows="max-content 1fr" gap="2">
          <Box display="flex">
            { isDrawing ? (
              <Text p="0" m="0">Click on the map and drag to draw selected area.</Text>
            ) : (
              <>
                <Button variant="link" onClick={() => setIsDrawing(true)} p="0">{bbox ? "Replace" : "Add"} bounding box filter</Button>
                { bbox && <IconButton variant="link" aria-label="Clear bounding box" icon={<MdDelete />} onClick={() => setBbox()} />}
              </>
            )}
          </Box>
          <Box>
            <Map ref={mapRef}>
              <Source
                id="background"
                type="raster"
                tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
                tileSize={256}
                attribution="Background tiles: © <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
              >
                <Layer id="background-tiles" type="raster" />
              </Source>
              <DrawBboxControl map={mapRef.current} isEnabled={isDrawing} handleDrawComplete={handleDrawComplete} bbox={bbox} />
            </Map>
          </Box>
        </Box>
        <Box gridColumn="1/3" justifySelf="end">
          <Button type="submit" size="sm">Apply filter</Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ItemListFilter;
