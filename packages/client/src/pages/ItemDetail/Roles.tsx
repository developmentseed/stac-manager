type RolesProps = { 
  roles: {
    spec: {
      label: "Purpose",
      mapping: {
        data: "Data"
        graphic: "Illustration"
        metadata: "Metadata"
        overview: "Overview"
        thumbnail: "Preview"
        visual: "Visualization"
        [key: string]: string
      }
    },
    value: string[];
  }
};

function Roles({ roles }: RolesProps) {
  const { value, spec } = roles;
  const { mapping } = spec;
  return (
    <>
      {value.map((val) => mapping[val] || val).join(", ")}
    </>  
  );
}

export default Roles;
