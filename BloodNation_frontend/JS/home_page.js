let slideIndex = 0;
showSlides();

function showSlides() {

    let slides = document.getElementsByClassName("heroSlide");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }



    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 8000);
}



const cardContainer = document.getElementById("cardContainer");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");



rightButton.addEventListener("click", () => {
    cardContainer.scrollLeft += 600;
});



leftButton.addEventListener("click", () => {
    cardContainer.scrollLeft -= 600;
});