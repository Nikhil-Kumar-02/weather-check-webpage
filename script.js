// const grantLocation = document.querySelector('.grant-location-container');
// const form = document.querySelector('.form-container');
// const loading = document.querySelector('.loading-container');
// const finalResult = document.querySelector('.user-info-container');
// const tab1 = document.querySelector('[data-userWeather]');
// const tab2 = document.querySelector('[data-searchWeather]');
// const grantAcess = document.querySelector('[data-grantAcess]');
// grantLocation.classList.add('active');

// function toggleActive(toRemove1 , toRemove2 , toAdd){
//     console.log( 'to add target',toAdd.classList);
//     console.log( 'to remove1 target',toRemove1.classList);
//     console.log( 'to remove2 target',toRemove2.classList);

//     if(toAdd.classList[0] == "form-container"){
//         console.log('loading added');
//         loading.classList.add('active');
//     }
    
//     toRemove1.classList.forEach(element => {
//         if(element == 'active'){
//             toRemove1.classList.remove('active');
//         }
//     });
    
//     toRemove2.classList.forEach(element => {
//         if(element == 'active'){
//             toRemove2.classList.remove('active');
//         }
//     });
    
//     if(toAdd.classList[0] == "form-container"){
//         console.log('loading removed');
//         loading.classList.remove('active');
//     }
//     toAdd.classList.add('active');
    
// }

// tab1.addEventListener('click' , () => {
//     console.log('tab1 clicked');
//     toggleActive(form,finalResult,grantLocation)
// });
// tab2.addEventListener('click' , () => {
//     console.log('tab 2 clicked');
//     toggleActive(finalResult,grantLocation,form);
// });
// grantAcess.addEventListener('click' , () => {
//     console.log('grant acess clicked');
//     toggleActive(form,grantLocation,finalResult);
// });


const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAcessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially we are at which tab usaer or search ?
let currTab = userTab;
// const APIKEY = "d1845658f92b31c64bd94f06f7188c9c";
const APIKEY = "1e26afa74647ff899094257bd21a40c4";
currTab.classList.add("current-tab");

function switchTab(clickedTab){
    // let check = 0;
    // console.log(clickedTab.classList);
    // clickedTab.classList.forEach((element) => {
    //     // console.log(element);
    //     if(element == "current-tab"){
    //         check = 1;
    //     }
    // });
    // if(check == 0){
    //     currTab.classList.toggle("current-tab");
    //     searchTab.classList.toggle("current-tab");
    // }

    //babbars way
    if(clickedTab != currTab){
        currTab.classList.remove("current-tab");
        currTab = clickedTab;
        currTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            //search form does not have active class so it is not visible so we have to make it visible
            userInfoContainer.classList.remove("active");
            grantAcessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click' , ()=>{
    //pass the clicked tab a the parameter
    switchTab(userTab);
});
searchTab.addEventListener('click' , ()=>{
    //pass the clicked tab a the parameter
    switchTab(searchTab);
});


//checks if coordinates are alredy present in the local storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //we dont have any coordinates locally so in such case we will show the grant access location page
        grantAcessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat , lon} = coordinates;
    //make grant acces invisible
    grantAcessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active"); 

    //api call
    try {
        //&&units=metric
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`);
        const data = await  res.json();
        console.log("this is result after making api call for certain lat and log " , data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        // loadingScreen.classList.remove("active");
        console.log(error);
    }
}

function renderWeatherInfo(weatherInfo){
    //firstly we have to fetch all the required elements where we want to make changes

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = weatherInfo?.main?.temp;
    windspeed.innerText = weatherInfo?.wind?.speed;
    humidity.innerText = weatherInfo?.main?.humidity;
    cloudiness.innerText = weatherInfo?.clouds?.all;
}

const grantAcessButton = document.querySelector("[data-grantAcess]");

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //show an alert message
        alert("your sys does not support geolocation");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

grantAcessButton.addEventListener('click' , getLocation);

//for seraching tab
let searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit" , (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName == "")
        return;
    else
        fetchCoordinatesFromName(cityName);
})

async function fetchCoordinatesFromName(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAcessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}`
        )
        //&units=metric
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        console.log(error);
    }
}
