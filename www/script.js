/*
La API disponible en el backend es:
```
  app.get('/categories/:id', listCategorySites)
  app.get('/categories',listCategories)
  app.get('/sites',listSites)

  app.post('/categories/:id', addNewSite)
  app.post('/categories', addNewCategory)

  app.delete('/sites/:id',delSite)
  app.delete('/categories/:id',delCategory)
```

### Añadir un site
En el body, la estructura será:
```
{
  "name": "test2",
  "url": "sample",
  "user": "test",
  "password": "test",
  "description": "test"
}
```

### Añadir una categoría
El body tendrá la siguiente estructura:

```
{ "name": "test_category" }
```
⚠️  Al enviar datos, es necesario indicar la cabecera `Content-type:application/json`
*/



//URL BASE
const urlBase = 'http://localhost:3000'



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 0 : RENDERIZAR CATEGORÍAS EN EL ASIDE       app.get('/categories',listCategories) //TODO PROBADO, FUNCIONA  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getCategories() {
  let url = `${urlBase}/categories`;

  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fallo al obtener listado de categorías. Status: ${response.status}`);
    }
    let data = await response.json();
    console.log(data);
    //console.log(response.status)
    return data;

  } catch (error) {
    console.log(error)
    return error;
  }
}

function cleanCategoriesList(){
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
    newLi.setAttribute('id', 'categoryListItem')

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
//FUNCIONALIDAD 0.2: GET BY ID        app.get('/categories/:id', listCategorySites) //TODO PROBADO, FUNCIONA  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getCategoryById(idCategory){
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
  headers:{'Content-Type': 'application/json'}
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
  if(!response.ok){
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
//en la Figura 1.                                                                      app.get('/sites',listSites)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

