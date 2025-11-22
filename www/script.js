
//URL BASE
const urlBase = 'http://localhost:3000'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 0 : GETALL CATEGORIES + RENDERIZAR CATEGORÍAS EN EL ASIDE       app.get('/categories',listCategories) //TODO PROBADO, FUNCIONA  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getCategories() {
  let url = `${urlBase}/categories`;

  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fallo al obtener listado de categorías. Status: ${response.status}`);
    }
    let data = await response.json();
    // console.log(data);
    //console.log(response.status)
    return data;

  } catch (error) {
    console.log(error)
    return error;
  }
}

function cleanCategoriesList() {
  let categoriesContainer = document.getElementById('categoryListGroup');
  categoriesContainer.innerHTML = "";
}

async function renderCategories() {
  cleanCategoriesList();
  const arrCategories = await getCategories();
  //console.log(arrCategories);
  let categoriesContainer = document.getElementById('categoryListGroup');

  for (let category of arrCategories) {
    //console.log(category)

    //creo elemento li
    let newLi = document.createElement('li');
    newLi.classList.add("list-group-item", "d-flex", "justify-content-between");
    newLi.textContent = category.name;
    //console.log(category.id);
    newLi.setAttribute('id', 'categoryListItem');
    newLi.onclick = () => {
      renderSitesByCategory(category.id)
    }

    //le añado button 
    let deleteButton = document.createElement('button')
    deleteButton.textContent = '⌫';
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    deleteButton.onclick = () => deleteCategory()

    categoriesContainer.appendChild(newLi);
    newLi.appendChild(deleteButton);

  }
}

renderCategories();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 0.2: GET BY ID        app.get('/categories/:id', listCategorySites) //TODO PROBADO, FUNCIONA  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getCategoryById(idCategory) {
  const url = `${urlBase}/categories/${idCategory}`;
  const response = await fetch(url);


  if (!response.ok) {
    throw new Error(`Respuesta con id ${idCategory} no encontrada.  Status: ${response.status}`);
  }

  const foundedCategory = await response.json();
  console.log(foundedCategory.name)
  return foundedCategory;


}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 1. AÑADIR NUEVA CATEGORÍA           app.post('/categories', addNewCategory). //TODO PROBADO, FUNCIONA  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function postCategory(categoryName) {

  const alreadyExist = (() => {
    const founded = arrCategories.find(cat => category.name === categoryName);
    if (founded !== undefined) return false;
    return true;
  })();

  if (!alreadyExist) {
    //0.DEFINO URL
    const url = `${urlBase}/categories`;

    //1. objeto a pasar al body
    const categoryData = { "name": categoryName };

    //2. defino options --> agrupa todos los parámetros de la solicitud
    const options = {
      //1. método
      method: 'POST',
      //2. headers
      headers: {
        'Content-Type': 'application/json'
      },
      //3. body
      body: JSON.stringify(categoryData)
    };

    try {
      //3. envío el objeto
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Fallo al añadir categoría. Status: ${response.status}`);
      }

      const newCategory = await response.json();
      console.log(`categoría creada : ${newCategory}`)

    } catch (error) {
      console.log(error)
    }
  } else {
    console.log("ya existe esa categoría")
    alert("ya existe esa categoría")
  }


}

async function setupCategoryForm() {
  //1. identifico el input y el botón
  let submitButton = document.getElementById('addCategoryOK');
  let input = document.getElementById('categoryName');



  //2. establezco onclick al pulsar le botón
  submitButton.addEventListener('click', () => {
    //extraigo datos del input
    const categoryName = input.value;

    //compruebo que el input no esté vacío
    if (!categoryName.trim()) {
      alert('es necesario asignar un nombre a la categoría')
      return;
    }

    //invoco a post
    postCategory(categoryName);

    //limpiar el input y cerrar el modal!
    input.value = '';
  }
  )
}

setupCategoryForm();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 2. ELIMINAR UNA CATEGORÍA          app.delete('/categories/:id',delCategory)    //TODO PROBADO, FUNCIONA 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function deleteCategory(idCategory) {
  //0.DEFINO URL + 1. introduzco el parámetro a pasar
  const url = `${urlBase}/categories/${idCategory}`;
  //console.log("la categoria a eliminar tiene id " + idCategory + " y la url es " + url)


  //2. defino options --> agrupa todos los elementos de la solicictud
  const options = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  }

  //3. envío el objeto
  try {
    //compruebo si existe la categoría
    const categoryToDelete = await getCategoryById(idCategory);

    //salgo sino
    if (!categoryToDelete) {
      console.log("No existe la categoría con ese id");
      return;
    }

    // Si existe intento borrarla
    const response = await fetch(url, options)
    if (!response.ok) {
      console.log("error al borrar categoría")
      alert("error al borrar categoría")
    }

    cleanCategoriesList();
    renderCategories();


  } catch (error) {
    console.error("Error en el proceso de borrado de categoria:", error);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 3. VER SITES BY CATEGORIA       Visualizar los sites de una categoría: Al seleccionar una categoría, deberemos
//recuperar del servidor los sites asociados a esa categoría y pintarlos como se ve
//en la Figura 1.                                                                      app.get('/sites',listSites)//TODO PROBADO, FUNCIONA 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function cleanSites() {
  let SitesByCategoryContainer = document.getElementById('SitesByCategoryContainer');
  SitesByCategoryContainer.innerHTML = "";
}


async function getSites() {
  const url = `${urlBase}/sites`;
  const response = await fetch(url)
  const allSites = await response.json();
  //console.log(allSites);
  return allSites;
}


async function renderSitesByCategory(categoryId) {
  cleanSites();
  console.log("has clicado el id" + categoryId);
  const allSites = await getSites();

  const sitesByCategory = allSites.filter((site) => site.categoryId === categoryId);
  //console.log(sitesByCategory)


  //enlazo con el html

  const SitesByCategoryContainer = document.getElementById('SitesByCategoryContainer');


  sitesByCategory.forEach(site => {
    //console.log(site)

    const newSiteContainer = document.createElement('tr');
    newSiteContainer.setAttribute('id', 'newSiteContainer');

    for (let attr in site) {

      if (attr == "name" || attr == "user" || attr == "createdAt") {

        // console.log("vamos por el atributo:  " + attr)
        //console.log("el valor del atributo es:  " + site[attr])
        const newatr = document.createElement('td');
        newatr.setAttribute('id', 'newAttribute');
        newatr.setAttribute('category-id', categoryId);
        newatr.innerHTML = site[attr];
        //console.log(newatr)

        newSiteContainer.appendChild(newatr)
      }

    }
    //console.log(creo actions)

    const newActionsField = document.createElement('td');
    newActionsField.setAttribute('id', 'newActionsField');
    newActionsField.innerHTML = `
  <div class="actions-container">
    <button class="btn btn-sm">📂</button>
    <button class="btn btn-lg delete-site-button" data-site-id="${site.id}" data-category-id="${categoryId}" >❌</button>
    <button class="btn btn-lg">✍🏻</button>
  </div>
`;

    //selecciono el botón de borrar creado y hago que llame a borrar al hacer click
    const deleteSiteBtn = newActionsField.querySelector(".delete-site-button");
    deleteSiteBtn.addEventListener('click', () => {
      const siteId = deleteSiteBtn.dataset.siteId;
      const categoryId = deleteSiteBtn.dataset.categoryId;
      console.log("clic en botón con siteId:", siteId, "pertenece a la categoría", categoryId);
      deleteSite(siteId, categoryId)
    });


    //console.log(newActionsField) 
    SitesByCategoryContainer.appendChild(newSiteContainer)
    newSiteContainer.appendChild(newActionsField)

    

  });
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 4. BORRAR SITE                                                      app.delete('/sites/:id',delSite)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function deleteSite(siteId, categoryId) {


  //url para fetch
  const url = `${urlBase}/sites/${siteId}`

  const options = {
    method: 'DELETE',
     headers: { 'Content-Type': 'application/json' }
  }



try {
  
  const response = await fetch(url , options)
  if (!response.ok){
    throw new Error("error al intentar eliminar el site")
  }
  console.log(response.status);
  
  
} catch (error) {
  console.error(error.message)
}

//refrescar la lista de sites
 renderSitesByCategory(categoryId);
}