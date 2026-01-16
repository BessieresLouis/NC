import {
  generateId,
  generateNumero,
  getItemById,
  loadItems,
  saveItems,
} from "./storage.js";

const form = document.getElementById("ncfForm");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const modeLabel = document.getElementById("modeLabel");
const statusBadge = document.getElementById("statusBadge");
const editToggle = document.getElementById("editToggle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") ?? "view";
const id = params.get("id");

let ncfItems = [];
let currentItem = null;

const setBadge = (statut) => {
  const closed = statut === "cloturee";
  statusBadge.textContent = closed ? "Clôturée" : "Ouverte";
  statusBadge.className = `badge ${closed ? "closed" : "open"}`;
};

const setFormEnabled = (enabled) => {
  [...form.elements].forEach((element) => {
    if (element.tagName === "BUTTON") return;
    element.disabled = !enabled;
  });
};

const fillForm = (item) => {
  Object.entries(item).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value ?? "";
    }
  });
  setBadge(item.statut);
};

const readForm = () => {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
};

const updateModeUI = () => {
  if (mode === "new") {
    pageTitle.textContent = "Créer une NCF";
    pageSubtitle.textContent = "Saisissez les informations de la non-conformité.";
    modeLabel.textContent = "Mode création";
    editToggle.hidden = true;
    saveButton.hidden = false;
    setFormEnabled(true);
    cancelButton.textContent = "Annuler";
  } else if (mode === "edit") {
    pageTitle.textContent = `Modifier ${currentItem?.numero ?? "NCF"}`;
    pageSubtitle.textContent = "Modifiez les informations puis enregistrez.";
    modeLabel.textContent = "Mode modification";
    editToggle.hidden = true;
    saveButton.hidden = false;
    setFormEnabled(true);
    cancelButton.textContent = "Annuler";
  } else {
    pageTitle.textContent = `Visualiser ${currentItem?.numero ?? "NCF"}`;
    pageSubtitle.textContent = "Lecture seule de la fiche NCF.";
    modeLabel.textContent = "Mode visualisation";
    editToggle.hidden = false;
    saveButton.hidden = true;
    setFormEnabled(false);
    cancelButton.textContent = "Retour";
  }
};

const handleSave = () => {
  const data = readForm();
  if (!data.numero || !data.date || !data.emetteur || !data.fournisseur) {
    alert("Merci de compléter les champs obligatoires.");
    return;
  }

  if (mode === "new") {
    const newItem = {
      ...data,
      id: generateId(),
    };
    ncfItems = [newItem, ...ncfItems];
    saveItems(ncfItems);
    window.location.href = `ncf.html?mode=view&id=${newItem.id}`;
    return;
  }

  ncfItems = ncfItems.map((item) => (item.id === currentItem.id ? { ...item, ...data } : item));
  saveItems(ncfItems);
  window.location.href = `ncf.html?mode=view&id=${currentItem.id}`;
};

const setupNewForm = () => {
  const today = new Date().toISOString().slice(0, 10);
  const numero = generateNumero(ncfItems, today);
  fillForm({
    numero,
    date: today,
    emetteur: "",
    fournisseur: "",
    programme: "",
    quantite: "",
    criticite: "non-conformite",
    traitement: "remplacement",
    statut: "ouverte",
    defaut: "",
    observation: "",
  });
  setBadge("ouverte");
};

loadItems()
  .then((items) => {
    ncfItems = items;
    if (mode === "new") {
      setupNewForm();
    } else {
      currentItem = getItemById(ncfItems, id);
      if (!currentItem) {
        window.location.href = "index.html";
        return;
      }
      fillForm(currentItem);
    }
    updateModeUI();
  })
  .catch((error) => {
    console.error("Erreur de chargement:", error);
  });

saveButton.addEventListener("click", handleSave);

editToggle.addEventListener("click", () => {
  if (!currentItem) return;
  window.location.href = `ncf.html?mode=edit&id=${currentItem.id}`;
});

cancelButton.addEventListener("click", () => {
  if (mode === "view") {
    window.location.href = "index.html";
    return;
  }
  if (currentItem) {
    window.location.href = `ncf.html?mode=view&id=${currentItem.id}`;
  } else {
    window.location.href = "index.html";
  }
});

form.addEventListener("change", () => {
  if (mode === "view") return;
  const data = readForm();
  setBadge(data.statut);
});
