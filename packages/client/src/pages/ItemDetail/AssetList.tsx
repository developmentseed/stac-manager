import { Box, Button, Icon, Link, Text, useDisclosure } from "@chakra-ui/react";
import { MdChevronRight, MdDownload, MdExpandMore } from "react-icons/md";
import { StacAsset } from "stac-ts";
import StacFields from "@radiantearth/stac-fields";
import { PropertyGroup } from "../../types";
import PropertyList from "./PropertyList";
import Roles from "./Roles";

type AssetProps = {
  assetKey: string;
  asset: StacAsset & {
    alternate?: {[key: string]: Alternate}
  };
}

type Alternate = {
  href: string;
  title?: string;
  description?: string;
}

function Asset({ asset, assetKey }: AssetProps) {
  const { title, description, roles, type, href, alternate, ...extension } = asset;
  const formattedProperties = StacFields.formatAsset({ roles, type })[0].properties;
  const formattedExtensions = StacFields.formatAsset(extension);

  const { isOpen, getButtonProps, getDisclosureProps } = useDisclosure();

  return (
    <Box borderBottom="1px dashed" borderColor="gray.300" pb="4">
      <Text as="h3" mb="1">{ title || assetKey }</Text>
      { description && <Text my="0">{ description }</Text>}
      <Text my="0" fontSize="sm">{ formattedProperties.type.formatted } | <Roles roles={formattedProperties.roles} /></Text>
      <Box mt="2" mb="4">
        { alternate ? (
          Object.entries(alternate)
            .map(([ key, val ]: [string, Alternate]) => (
              <Button as={Link} key={key} href={val.href} size="xs">
                <Icon as={MdDownload} boxSize="4" mr="1" />
                { val.title || val.href }
              </Button>
            ))
        ) : (
          <Button as={Link} href={href} size="xs">
            <Icon as={MdDownload} boxSize="4" mr="1" />
            Download
          </Button>
        ) }
      </Box>
      { formattedExtensions.length > 0 && (
        <>
          <Button
            size="sm"
            variant="link"
            {...getButtonProps()}
            display="flex"
            alignItems="center"
          >
            <Icon as={isOpen ? MdExpandMore : MdChevronRight} boxSize="3" />
            <span>Asset properties</span>
          </Button>
          <Box {...getDisclosureProps()}>
            { formattedExtensions.map((property: PropertyGroup) => <PropertyList key={property.extension} properties={property} headerLevel="h4" /> )}
          </Box>
        </>
      ) }
    </Box>
  );
}

type AssetListProps = {
  assets: { [key: string]: StacAsset }
}

function AssetList({ assets }: AssetListProps) {
  return (
    <>
      <Text as="h2" mt="4">Assets</Text>
      { Object.entries(assets).map(([ key, asset ]) => (
        <Box key={key} mb="4">
          <Asset asset={asset} assetKey={key} />
        </Box>
      ))}
    </>
  );
}

export default AssetList;
