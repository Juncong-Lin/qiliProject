const xhr = new XMLHttpRequest();

xhr.addEventListener('load', () => {
  console.log( xhr.respond);
})

xhr.open("GET", "https://supersimplebackend.dev/"); 
xhr.send(); 