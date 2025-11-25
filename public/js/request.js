
  const pricing = JSON.parse(JSON.stringify(<%- JSON.stringify(service.pricing) %>));

  const select = document.getElementById("prioritySelect");
  const priceInput = document.getElementById("priceInput");

  select.addEventListener("change", () => {
      priceInput.value = pricing[select.value];
  });

