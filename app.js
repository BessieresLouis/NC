const tableBody = document.getElementById("ncfTable");
const resultCount = document.getElementById("resultCount");
const filtersForm = document.getElementById("filters");
const resetFiltersButton = document.getElementById("resetFilters");
const toggleFormButton = document.getElementById("toggleForm");
const formPanel = document.getElementById("formPanel");
const ncfForm = document.getElementById("ncfForm");
const cancelFormButton = document.getElementById("cancelForm");
const rowTemplate = document.getElementById("rowTemplate");

let ncfItems = [];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
};

const renderTable = (items) => {
  tableBody.innerHTML = "";
  items.forEach((item) => {
    const row = rowTemplate.content.cloneNode(true);
    row.querySelector("[data-field='numero']").textContent = item.numero;
    row.querySelector("[data-field='date']").textContent = formatDate(item.date);
    row.querySelector("[data-field='fournisseur']").textContent = item.fournisseur;
    row.querySelector("[data-field='defaut']").textContent = item.defaut;
    row.querySelector("[data-field='criticite']").textContent = item.criticite === "alerte"
      ? "Alerte"
      : "Non-conformité";
    row.querySelector("[data-field='traitement']").textContent =
      item.traitement?.replace(/^[a-z]/, (char) => char.toUpperCase()) ?? "-";
    const statusCell = row.querySelector("[data-field='statut']");
    const badge = document.createElement("span");
    badge.className = `badge ${item.statut === "cloturee" ? "closed" : "open"}`;
    badge.textContent = item.statut === "cloturee" ? "Clôturée" : "Ouverte";
    statusCell.append(badge);
    tableBody.append(row);
  });
  resultCount.textContent = `${items.length} résultat${items.length > 1 ? "s" : ""}`;
};

const applyFilters = () => {
  const data = new FormData(filtersForm);
  const filters = Object.fromEntries(data.entries());

  const filtered = ncfItems.filter((item) => {
    const numeroOk = !filters.numero || item.numero.toLowerCase().includes(filters.numero.toLowerCase());
    const fournisseurOk = !filters.fournisseur || item.fournisseur.toLowerCase().includes(filters.fournisseur.toLowerCase());
    const criticiteOk = !filters.criticite || item.criticite === filters.criticite;
    const statutOk = !filters.statut || item.statut === filters.statut;

    const date = item.date ? new Date(item.date) : null;
    const dateDebutOk = !filters.dateDebut || (date && date >= new Date(filters.dateDebut));
    const dateFinOk = !filters.dateFin || (date && date <= new Date(filters.dateFin));

    const searchValue = filters.search?.toLowerCase();
    const searchOk = !searchValue || [
      item.numero,
      item.fournisseur,
      item.defaut,
      item.observation,
      item.traitement,
    ].some((value) => value?.toLowerCase().includes(searchValue));

    return numeroOk && fournisseurOk && criticiteOk && statutOk && dateDebutOk && dateFinOk && searchOk;
  });

  renderTable(filtered);
};

const toggleForm = (show) => {
  formPanel.hidden = !show;
  toggleFormButton.textContent = show ? "Masquer le formulaire" : "Nouvelle NCF";
};

const loadData = async () => {
  const response = await fetch("data.json");
  ncfItems = await response.json();
  renderTable(ncfItems);
};

filtersForm.addEventListener("input", applyFilters);
resetFiltersButton.addEventListener("click", () => {
  filtersForm.reset();
  renderTable(ncfItems);
});

ncfForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(ncfForm);
  const newItem = Object.fromEntries(data.entries());
  ncfItems = [
    {
      ...newItem,
      date: newItem.date,
    },
    ...ncfItems,
  ];
  ncfForm.reset();
  toggleForm(false);
  renderTable(ncfItems);
});

cancelFormButton.addEventListener("click", () => {
  ncfForm.reset();
  toggleForm(false);
});

toggleFormButton.addEventListener("click", () => {
  toggleForm(formPanel.hidden);
});

loadData().catch((error) => {
  console.error("Erreur de chargement des données:", error);
});
