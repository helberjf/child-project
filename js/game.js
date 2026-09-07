const monstro = document.getElementById("monstro");
const textoPontos = document.getElementById("pontos");
const som = new Audio("assets/sounds/laserLarge_000.ogg");

let pontos = 0;

let x = 200;
let y = 200;

let velocidadeX = 3;
let velocidadeY = 3;

// posição inicial
monstro.style.left = x + "px";
monstro.style.top = y + "px";

// quando clicar
monstro.addEventListener("click", () => {

    som.currentTime = 0;
    som.play();
    pontos++;
    textoPontos.innerText = pontos;

    moverMonstro();

    if (pontos === 10) {
        alert("🏆 Você venceu!");
    }

});

// muda o personagem
function trocarMonstro(novoMonstro){
    monstro.innerText = novoMonstro;
}

// teletransporta o monstro
function moverMonstro(){

    x = Math.random() * (window.innerWidth - monstro.offsetWidth);

    y = Math.random() * (window.innerHeight - monstro.offsetHeight);

    monstro.style.left = x + "px";
    monstro.style.top = y + "px";

}

// faz ele andar
function andar(){

    x += velocidadeX;
    y += velocidadeY;

    if(x <= 0 || x >= window.innerWidth - monstro.offsetWidth){
        velocidadeX *= -1;
    }

    if(y <= 0 || y >= window.innerHeight - monstro.offsetHeight){
        velocidadeY *= -1;
    }

    monstro.style.left = x + "px";
    monstro.style.top = y + "px";

}

const mira = document.getElementById("mira");

document.addEventListener("mousemove", (event)=>{

    mira.style.left = event.clientX + "px";
    mira.style.top = event.clientY + "px";

});

setInterval(andar,20);
