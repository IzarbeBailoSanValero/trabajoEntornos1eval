const urlBase = 'http://localhost:3000'

//INICIALIZACIÓN DE LA PÁGINA

async function getCategories() {
    {
        try {

            const url = `${urlBase}/categories`

            //fetch
            const response = await fetch(url);

            //si no ha ido bien la llamada, detenemos
            if (!response.ok) {
                throw new Error(`Error en la petición GET al obtener categorías: ${response.status}`);

            }

            //obtener data
            let data = await response.json();

            if (data == null) {
                throw new Error(`valor null de las categorias`);
            } else if (data.length === 0) {
                console.log("la lista de categorías está vacía");
                alert("no hay categorías para seleccionar");
            }

            return data;
        } catch (error) {
            console.error("error al obtener categorías:  ", error.message)
            return [];   //sirve para que si algo va mal no se devuelva undefined al usuario, mejor vacío

        }
    }
}


function renderDropdown(categories) {
    //container
    const selectElement = document.getElementById("customSelect");

    //hago el render si hay categorías
    if (categories.length == 0) {
        //creo un boton option que dice que no hay categorías.
        console.log("no hay categorías para mostrar")
        const optionElement = document.createElement('option');
        optionElement.textContent = "no hay categorías para asociar";
        selectElement.appendChild(optionElement);
        return;
    }
    //hago el display por cada elemento
    for (let category of categories) {
        const optionElement = document.createElement('option');
        optionElement.textContent = category.name;
        optionElement.setAttribute('value', category.name);
        selectElement.appendChild(optionElement);
    }

}


(async function initialize() {
    //tomo datos
    let categories = await getCategories();

    //los muestro
    renderDropdown(categories);
})();


// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 3. AÑADIR UN SITE TO CATEGORIA  
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//qué pasa cuando el usuario hace submit, función orquestadora
const form = document.querySelector("form");
form.addEventListener('submit', async (e) => {
    e.preventDefault(); //evita el comportamiento tradicional del submit en html. Así no recarga la pagina ni evia la info con su método tradicional;  lo hago yo aquí con fetch
    const inputs = formChecker();
    const categories = await getCategories();
    const category = getCategorySelected(categories, inputs)
    const postBody = createPostBody(category,  inputs);
    postSite(postBody, category )

})



//CHEQUEO DEL FORMULARIO
function formChecker() {

    //booleano de resultado
    let isFormValid = true;


    //identifico resultados de inputs
    const inputName = document.getElementById("inputName");
    const inputUrl = document.getElementById("inputUrl");
    const inputUser = document.getElementById("inputUser");
    const inputPassword = document.getElementById("inputPassword");
    const inputDescription = document.getElementById("inputDescription");
    const customSelect = document.getElementById("customSelect");


    //elementos 
    const inputs = [
        {
            name: "name",
            value: inputName.value.trim(),
            element: inputName
        },
        {
            name: "url",
            value: inputUrl.value.trim(),
            element: inputUrl
        },
        {
            name: "user",
            value: inputUser.value.trim(),
            element: inputUser
        },
        {
            name: "password",
            value: inputPassword.value,
            element: inputPassword
        },
        {
            name: "description",
            value: inputDescription.value.trim(),
            element: inputDescription
        },
        {
            name: "category",
            value: customSelect.value.trim(),
            element: customSelect
        }
    ]

    //console.log("los inputs registrados son:  ", inputs)

    //elementos a validar no vacíos
    const inputsMandatory = [inputs[0], inputs[2], inputs[3], inputs[4]];

    for (let inp of inputsMandatory) {
        if (!inp.value) {
            alert(`el campo ${inp.name} no puede estar vacío`);
            console.error(`el campo ${inp.name} no puede estar vacío`);
            isFormValid = false;
            console.log("el fomrulario NO es válido")
            return;
        }
    }
    console.log("el fomrulario es válido")
    return inputs;
}


    function getCategorySelected(categories, inputs){
     let category;
    // console.log("categories", categories);
    // console.log( "input 5", inputs[5].value);
    try {
        category = categories.find(cat => cat.name === inputs[5].value)
        if (!category) {
            throw new Error("categoría no encontrada")
        }
    } catch (error) {
        console.error("fallo al obtener id de la categoría seleccionada", error.message)
    }
    return category;
}
    

//CONSTRUCCIÓN DE OBJETO (POST)
function createPostBody(category,inputs) {

    //construir el body de la petición
    const postBody = {
        "name": inputs[0].value,
        "url": inputs[1].value,
        "user": inputs[2].value,
        "password": inputs[3].value,
        "description": inputs[4].value,
        "categoryId": category.id
    }

    console.log("el cuerpo de la petición post será ", postBody)
    return postBody

}

//ENVÍO DE FORMULARIO
async function postSite(postBody, category) {
   try {
     const url = `${urlBase}/categories/${category.id}`

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody)
    }

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error("error al enviar nuevo sitio");
    }

    const newSite = await response.json()   
    console.log("nuevo sitio creado: ", newSite)
    return newSite
   } catch (error) {
    console.error("error en el envío de datos para la creación de nuevo sitio", error.message)
   }

   
}