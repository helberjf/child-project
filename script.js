const monstro = document.getElementById("monstro");
const textoPontos = document.getElementById("pontos");

let pontos = 0;

monstro.addEventListener("click", function () {

    pontos = pontos + 1;

    textoPontos.innerText = pontos;

    moverMonstro();

});


function moverMonstro() {

    const x = Math.random() * 800;
    const y = Math.random() * 400;

    monstro.style.left = x + "px";
    monstro.style.top = y + "px";

}