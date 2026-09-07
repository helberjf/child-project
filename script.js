const monstro = document.getElementById("monstro");
const textoPontos = document.getElementById("pontos");

let pontos = 0;

monstro.addEventListener("click", function () {

    pontos = pontos + 1;

    textoPontos.innerText = pontos;

});