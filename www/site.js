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
                Swal.fire("no hay categorías para seleccionar");
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

    if (!inputs) {
        console.log("Deteniendo el envío porque el formulario no es válido.");
        return; 
    }
    const categories = await getCategories();
    const category = getCategorySelected(categories, inputs)
    const postBody = createPostBody(category, inputs);
    postSite(postBody, category);
    window.location.href = "./index.html";
    Swal.fire("site añadido con éxito")
})




//FUNCIONALIDAD EXTRA: SI LA LONGITUD DE LA CONTRASEÑA NO ES LA INDICADA, LO INDICAMOS WHEN BLUR
//en bootstrap los items con esa clase de invalid feedback se muestran directamente en roj
const inputPassword = document.getElementById("inputPassword");
const invalidFieldPassword = document.getElementById("invalid-feedback");

function validatePaswordLength(){
    let pass = inputPassword.value;

    if(pass.length < 8){
        invalidFieldPassword.style.visibility = 'visible'
        invalidFieldPassword.style.display = "block";
        console.log("aviso visible")
    }else{
        invalidFieldPassword.style.visibility = 'hidden'
        console.log("aviso no visible")
    }
}


inputPassword.addEventListener('blur', validatePaswordLength)


//si el nombre esta vacío, también lo mostramos
const inputName = document.getElementById("inputName");
const invalidFieldName = document.getElementById("invalid-feedback--name");

function validateNameLength(){
    let name = inputName.value.trim();

    if(name.length === 0){
        invalidFieldName.style.visibility = 'visible'
        invalidFieldName.style.display = "block";
        console.log("aviso visible para nombre")
    }else{
        invalidFieldName.style.visibility = 'hidden'
        console.log("aviso no visible")
    }
}

inputName.addEventListener('blur', validateNameLength)








//CHEQUEO DEL FORMULARIO
function formChecker() {

    

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
    const inputsMandatory = [inputs[0], inputs[2], inputs[3]];

    for (let inp of inputsMandatory) {
        if (!inp.value) {
            Swal.fire(`el campo ${inp.name} no puede estar vacío`);
            console.error(`el campo ${inp.name} no puede estar vacío`);
            console.log("el fomrulario NO es válido")
            return false;
        }
    }

    if (inputs[3].value.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña insegura',
            text: 'La contraseña debe tener al menos 8 caracteres'
        });
        return false;
    }

    
    if (inputs[5].value === "" || inputs[5].value.includes("no hay categorías")) {
        Swal.fire('Debes seleccionar una categoría válida');
        return false;
    }

    // Si el código llega hasta aquí, es que no ha entrado en ningún error
    console.log("El formulario es válido");
    return inputs;
}


function getCategorySelected(categories, inputs) {
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
function createPostBody(category, inputs) {

    //construir el body de la petición
    const postBody = {
        "name": inputs[0].value,
        "url": inputs[1].value,
        "user": inputs[2].value,
        "password": inputs[3].value,
        "description": inputs[4].value
    }

    console.log("el cuerpo de la petición post será ", postBody)
    return postBody

}

//ENVÍO DE FORMULARIO        POST SITE
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
        Swal.fire("Error al guardar el sitio");
    }

}

//BOTÓN DE CANCELAR
const cancelButton = document.getElementById("CancelButton");

cancelButton.addEventListener('click', () => {
    window.location.href = "./index.html";
})



// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONALIDAD 6. AUTOGENERAR CONTRASEÑA SEGURA         //TODO: BIEN
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//añadir onclick al. icono
const autogeneratePassIcon = document.getElementById("autogeneratePassIcon");
autogeneratePassIcon.addEventListener('click', (e) => {
    let myRandomPassword = calculatePassword();
    const inputPassword = document.getElementById("inputPassword");
    inputPassword.value = myRandomPassword;
    console.log("nueva contraseña: ", myRandomPassword)
    validatePaswordLength()
    
    ////////////////////////
})


//algoritmo para generación de contraseña --> min 8 caracteres + no solo alfanum (añadire caracteres especiales + mayusc/minusc)
function calculatePassword() {
    //defino tipos de carácter para hace rrandoms con ellos
    const numbersASCII = (() => {
        let array = [];
        for (let x = 48; x <= 57; x++) {
            array.push(x);
        }
        return array
    })();

    const capitalsASCII = (() => {
        let array = [];
        for (let x = 65; x <= 90; x++) {
            array.push(x);
        }
        return array
    })();

    const lowersASCII = (() => {
        let array = [];
        for (let x = 97; x <= 122; x++) {
            array.push(x);
        }
        return array
    })();

    const symbolsASCII = (() => {
        let array = [];
        for (let x = 32; x <= 47; x++) {
            array.push(x);
        }
        return array
    })();

    //BUSCO COMO HACER EL SPREAD OPERATOR Y TAMBIÉN AYUDA PARA LA CONVERISON DE ASCI A CARACTER Y MATH FLOOR-MATH RANDOM + COMO BARAJAR VALORES

    //creo alphabet que una todas --> vuelco los arrays (spread operator)
    const myAlphabetASCII = [...numbersASCII, ...capitalsASCII, ...lowersASCII, ...symbolsASCII]

    let password = "";


    let randomer = function (array) {
        let randomIndex = Math.floor(Math.random() * array.length); // índice entre 0 y length-1
        let code = array[randomIndex]; //random ASCII value
        let randomChar = String.fromCharCode(code); //random char
        password += randomChar; //concateno
    }

    for (let index = 0; index < 16; index++) {
       // console.log ("vuelta: ", index)
        switch (index) {
            case 0:
                randomer(numbersASCII);
                break;
            case 1:
                randomer(capitalsASCII);
                break;
            case 2:
                randomer(lowersASCII);
                break;
            case 3:
                randomer(symbolsASCII);
                break;
            default:
                randomer(myAlphabetASCII);
               
        }


        //shuffle --> lo busco
        let arr = password.split(""); //separo por caracteres y creo un array
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        password = arr.join(""); //lo uno de nuevo en un string

    

    }

return password;


}




