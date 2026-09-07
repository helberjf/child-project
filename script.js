const monstro = document.getElementById("monstro");
const textoPontos = document.getElementById("pontos");

let pontos = 0;


monstro.addEventListener("click", function () {

    pontos = pontos + 1;

    textoPontos.innerText = pontos;

    moverMonstro();

    if (pontos === 10) {
        alert("🏆 PARABÉNS! Você venceu!");
    }

});


function moverMonstro() {

    const x = Math.random() * 800;
    const y = Math.random() * 400;

    monstro.style.left = x + "px";
    monstro.style.top = y + "px";

}


function trocarMonstro(novoMonstro) {
    monstro.innerText = novoMonstro;
}