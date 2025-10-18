vegaEmbed('#flightVis', 'specs/travel_map.json')
  .then(result => {
    // result.view is the Vega View instance
    console.log("Visualization loaded successfully");
  })
  .catch(console.error);
