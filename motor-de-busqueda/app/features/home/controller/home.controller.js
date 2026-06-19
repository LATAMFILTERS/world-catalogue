export function getHomeModel() {
  return {
    sections: [
      {
        id: "hero",
        type: "hero",
        props: {
          title: "Industrial Filtration Platform",
          subtitle: "Global search system for hydraulic filters and parts"
        }
      },
      {
        id: "stats",
        type: "stats",
        props: {}
      },
      {
        id: "industries",
        type: "industries",
        props: {}
      }
    ]
  };
}
