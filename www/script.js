
//URL BASE
const urlBase = 'http://localhost:3000'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 0 : GETALL CATEGORIES + RENDERIZAR CATEGORÍAS EN EL ASIDE       app.get('/categories',listCategories)
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
    return [];
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
      //inserto el titulo de la catgeoria
      const titleCategory = document.getElementById("titleCategory");
      titleCategory.innerHTML = `${category.name}`

      //inserto sites
      renderSitesByCategory(category.id)
    }

    //le añado button 
    let deleteButton = document.createElement('button')
    deleteButton.textContent = '⌫';
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    deleteButton.onclick = () => deleteCategory(category.id)

    categoriesContainer.appendChild(newLi);
    newLi.appendChild(deleteButton);

  }
}

renderCategories();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 0.2: GET BY ID        app.get('/categories/:id', listCategorySites) 
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
//FUNCIONALIDAD 1. AÑADIR NUEVA CATEGORÍA           app.post('/categories', addNewCategory). 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function postCategory(categoryName) {
  //console.log("CATEGORY NAME: ", categoryName)

  const arrCategories = await getCategories();

  const founded = arrCategories.find(cat => cat.name === categoryName);

  console.log("founded", founded)


  if (founded == undefined) //no existe, la creamos
  {
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
      console.log(`categoría creada : ${newCategory.name}`)


      return response;



    } catch (error) {
      console.log(error)
      return false;
    }
  } else {
    console.log("ya existe esa categoría")
    Swal.fire("ya existe esa categoría")
    return false;
  }



}

async function setupCategoryForm() {
  //1. identifico el input y el botón
  let submitButton = document.getElementById('addCategoryOK');
  let input = document.getElementById('categoryName');



  //2. establezco onclick al pulsar el botón
  submitButton.addEventListener('click', async () => {
    //extraigo datos del input
    const categoryName = input.value;

    //compruebo que el input no esté vacío
    if (!categoryName.trim()) {
      Swal.fire('es necesario asignar un nombre a la categoría')
      return;
    }


    try {
      //invoco a post
      const response = await postCategory(categoryName);
      if (response.ok) {
        //ahora debo renderizar de nuevo las categorías para incluirlo
        cleanCategoriesList();
        renderCategories();

        //limpiar el input 
        input.value = '';

        //esconder el modal: lo miro, no se como se maneja en bootstrap

        const categoryModal = document.getElementById("categoriesModal");

        // 1. Crea la instancia del objeto Modal de Bootstrap
        const modalInstancia = bootstrap.Modal.getInstance(categoryModal) || new bootstrap.Modal(categoryModal);
        // 2. Cierra el modal
        modalInstancia.hide();

      }

    } catch (error) {
      console.error("error al enviar la categoría", error.message)
      modalInstancia.hide();
    }


  }
  )
}

setupCategoryForm();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 2. ELIMINAR UNA CATEGORÍA          app.delete('/categories/:id',delCategory)   
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function deleteCategory(idCategory) {
  //0.DEFINO URL + 1. introduzco el parámetro a pasar
  const url = `${urlBase}/categories/${idCategory}`;
  //console.log("la categoria a eliminar tiene id " + idCategory + " y la url es " + url)


  //2. options para enviar a la peticion
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
      Swal.fire("error al borrar categoría")
    }

    cleanCategoriesList();
    renderCategories();


  } catch (error) {
    console.error("Error en el proceso de borrado de categoria:", error);
    return null;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 3. VER SITES BY CATEGORIA                                  app.get('/sites',listSites)
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
  //console.log("has clicado el id" + categoryId);
  const allSites = await getSites();

  const sitesByCategory = allSites.filter((site) => site.categoryId === categoryId);
  //console.log(sitesByCategory)


  //enlazo con el html
  const SitesByCategoryContainer = document.getElementById('SitesByCategoryContainer');


  sitesByCategory.forEach(site => {
    //console.log(site)

    const newSiteContainer = document.createElement('tr');
    newSiteContainer.classList.add('newSiteContainer')


    for (let attr in site) {

      if (attr == "name" || attr == "user" || attr == "createdAt") {

        // console.log("vamos por el atributo:  " + attr)
        //console.log("el valor del atributo es:  " + site[attr])
        const newatr = document.createElement('td');
        newatr.classList.add('newAttribute');
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
      const categoryId = parseInt(deleteSiteBtn.dataset.categoryId);
      //console.log("clic en botón con siteId:", siteId, "pertenece a la categoría", categoryId);
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

    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error("error al intentar eliminar el site")
    }
    console.log("site eliminado con éxito:  ", response.status);


  } catch (error) {
    console.error(error.message)
  }

  //refrescar la lista de sites
  renderSitesByCategory(categoryId);
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 7. BARRA DE BÚSQUEDA QUE FILTRA POR SITE O CATEGORÍA
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const searchBtn = document.getElementById("searchBtn")
const ulContainer = document.getElementById("ulContainer")

// event listener en la lupa 
searchBtn.addEventListener('click', async () => {
  // Limpiar resultados anteriores
  ulContainer.innerHTML = "";

  //recojo el input de texto
  const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
  if(!searchInput) return;
  console.log("search input toLower: ", searchInput)

  const radioOptions = document.querySelectorAll(".radio-option");

  //recojo la opción del rdio button ---> miro como se hace para recoger el valor
  let selectedType = (() => {
    for (let option of radioOptions) {
      if (option.checked) {
        console.log("selected type:", option.value)
        return option.value
      }
    }
  })();

  //traigo resultados de filtrado
  let fitsCriteriaArray = await filterByBoth(selectedType, searchInput);
  console.log("array que cumple criterios: ", fitsCriteriaArray)

  //2. RENDERIZADO----: genero ul con los lis coincidentes
  const ul = document.createElement('ul')
  ul.classList.add("list-group", "results-from-search")

  //Si no hay resultados coincidentes lo communico y no hago más
  if (fitsCriteriaArray.length === 0){
    const li = document.createElement('li');
    li.textContent = "No se encontraron coincidencias.";
    ul.appendChild(li);
    ulContainer.appendChild(ul);
    return;
  }
  //para obtener luego sites por categoría: 
  const allSites = await getSites();

  fitsCriteriaArray.forEach(item => {
    console.log("entro aquí")
    const li = document.createElement('li')
    console.log("item:  ", item)

    if (selectedType === "categories") {
      //obtengo sites por esa categoria
      const sitesByCategory = allSites.filter((site) => site.categoryId === item.id);
      console.log("sites de esta categoría: ", sitesByCategory)


      li.innerHTML = `
    <h5>categoria encontrada: ${item.name}</h5>
    <p>Sites asociados a esa categoría: </p>
    `
      sitesByCategory.forEach(site => {
        li.innerHTML += `<p>${site.name} --> url: ${site.url}  , user: ${site.user}
      </p><br>`
      });

    } else if (selectedType === "sites") {
      
      li.innerHTML = `
    <h5>site encontrado:</h5> <h1>${item.name}</h1> <p>sus datos principales asociados son: </p>
    <p>url: ${item.url}  ,       user: ${item.user},      fecha de creación: ${item.createdAt}</p>`  
    }
    ul.appendChild(li)

  });

  ulContainer.appendChild(ul)

})







async function filterByBoth(selectedType, searchInput) {
  if (selectedType === 'categories') {
    //busca por categorias
    const listAllCategories = await getCategories();
    const fitsCriteriaArray = listAllCategories.filter((cat) => cat.name.toLowerCase() === searchInput);
    return fitsCriteriaArray





  } else if (selectedType === 'sites') {
    //busca por site
    const listAllSites = await getSites();

    const fitsCriteriaArray = listAllSites.filter((site) => site.name.toLowerCase() === searchInput);

    return fitsCriteriaArray
  }
}