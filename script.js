// Array de cores nomeadas do HTML
const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "cyan",
  "magenta",
  "lime"
]

// Variáveis do jogo
let secretColor = ""
let attemptsLeft = 3
let gameActive = true
let triedColors = []

// Elementos do DOM
const colorInput = document.getElementById("color-input")
const guessBtn = document.getElementById("guess-btn")
const restartBtn = document.getElementById("restart-btn")
const feedback = document.getElementById("feedback")
const attemptsCount = document.getElementById("attempts-count")
const colorChips = document.getElementById("color-chips")

// Inicializar o jogo
function initGame() {
  // Sortear uma cor aleatória
  const randomIndex = Math.floor(Math.random() * colors.length)
  secretColor = colors[randomIndex]

  // Resetar variáveis
  attemptsLeft = 3
  gameActive = true
  triedColors = []

  // Resetar interface
  colorInput.value = ""
  colorInput.disabled = false
  guessBtn.disabled = false
  restartBtn.classList.add("hidden")
  feedback.textContent = ""
  feedback.className = "feedback"
  attemptsCount.textContent = attemptsLeft
  document.body.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  document.body.classList.remove("game-won")

  // Focar no input
  colorInput.focus()
  createColorChips()

  // Log para debug (remova em produção)
  console.log("[v0] Cor secreta sorteada:", secretColor)
}

// Criar chips de cores disponíveis
function createColorChips() {
  colorChips.innerHTML = ""
  colors.forEach((color) => {
    const chip = document.createElement("span")
    chip.className = "color-chip"
    chip.dataset.color = color
    chip.textContent = color
    chip.style.backgroundColor = color

    // Ajustar cor do texto para melhor contraste
    const luminance = getColorLuminance(color)
    chip.style.color = luminance > 0.5 ? "#000" : "#fff"

    colorChips.appendChild(chip)
  })
}

function removeColorChip(color) {
  const chip = colorChips.querySelector(`[data-color="${color}"]`)
  if (chip) {
    chip.style.animation = "chipDisappear 0.5s ease forwards"
    setTimeout(() => {
      chip.remove()
    }, 500)
  }
}

// Calcular luminância da cor (para ajustar contraste do texto)
function getColorLuminance(color) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

// Função para verificar a tentativa
function checkGuess() {
  if (!gameActive) return

  const guess = colorInput.value.trim().toLowerCase()

  // Validar entrada vazia
  if (guess === "") {
    showFeedback("⚠️ Por favor, digite uma cor!", "error")
    colorInput.classList.add("shake")
    setTimeout(() => colorInput.classList.remove("shake"), 500)
    return
  }

  // Verificar se a cor está na lista
  if (!colors.includes(guess)) {
    showFeedback("❌ Esta cor não está na lista de cores disponíveis!", "error")
    colorInput.value = ""
    colorInput.focus()
    return
  }

  if (triedColors.includes(guess)) {
    showFeedback("⚠️ Você já tentou esta cor!", "error")
    colorInput.value = ""
    colorInput.focus()
    return
  }

  // Comparar com a cor secreta
  if (guess === secretColor) {
    // ACERTOU!
    gameActive = false
    document.body.style.background = secretColor
    document.body.classList.add("game-won")
    showFeedback(`🎉 Parabéns! Você acertou! A cor era ${secretColor}!`, "success")
    colorInput.disabled = true
    guessBtn.disabled = true
    restartBtn.classList.remove("hidden")
    launchFireworks()

    console.log("[v0] Jogador acertou a cor!")
  } else {
    // ERROU
    triedColors.push(guess)
    removeColorChip(guess)

    attemptsLeft--
    attemptsCount.textContent = attemptsLeft

    if (attemptsLeft > 0) {
      showFeedback(`❌ Errou! Você ainda tem ${attemptsLeft} tentativa${attemptsLeft > 1 ? "s" : ""}.`, "error")
      colorInput.value = ""
      colorInput.focus()

      console.log("[v0] Tentativa incorreta. Tentativas restantes:", attemptsLeft)
    } else {
      // FIM DO JOGO
      gameActive = false
      showFeedback(`😢 Fim de jogo! A cor era: ${secretColor}`, "game-over")
      document.body.classList.add("game-won")
      colorInput.disabled = true
      guessBtn.disabled = true
      restartBtn.classList.remove("hidden")

      console.log("[v0] Fim de jogo. Cor correta era:", secretColor)
    }
  }
}

// Mostrar feedback
function showFeedback(message, type) {
  feedback.textContent = message
  feedback.className = `feedback ${type}`
}

// Event Listeners
guessBtn.addEventListener("click", checkGuess)

colorInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkGuess()
  }
})

restartBtn.addEventListener("click", () => {
  console.log("[v0] Reiniciando o jogo...")
  initGame()
})

function launchFireworks() {
  const duration = 5000 // Duração total da animação
  const endTime = Date.now() + duration

  const fireworkInterval = setInterval(() => {
    if (Date.now() > endTime) {
      clearInterval(fireworkInterval)
      return
    }

    // Criar fogos das laterais esquerda e direita
    createFirework("left")
    createFirework("right")
  }, 200)
}

function createFirework(side) {
  const firework = document.createElement("div")
  firework.className = "firework"

  // Posicionar nas laterais
  const startX = side === "left" ? 0 : window.innerWidth
  const startY = Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1

  firework.style.left = startX + "px"
  firework.style.top = startY + "px"

  document.body.appendChild(firework)

  // Criar partículas do fogo de artifício
  const particleCount = 50
  const colors = ["#ff0", "#f0f", "#0ff", "#ff6b6b", "#4ecdc4", "#45b7d1", "#ffa502"]

  setTimeout(() => {
    for (let i = 0; i < particleCount; i++) {
      createParticle(startX, startY, colors[Math.floor(Math.random() * colors.length)])
    }
    firework.remove()
  }, 100)
}

function createParticle(x, y, color) {
  const particle = document.createElement("div")
  particle.className = "firework-particle"
  particle.style.left = x + "px"
  particle.style.top = y + "px"
  particle.style.backgroundColor = color

  const angle = Math.random() * Math.PI * 2
  const velocity = Math.random() * 200 + 100
  const vx = Math.cos(angle) * velocity
  const vy = Math.sin(angle) * velocity

  particle.style.setProperty("--vx", vx + "px")
  particle.style.setProperty("--vy", vy + "px")

  document.body.appendChild(particle)

  setTimeout(() => {
    particle.remove()
  }, 1500)
}

// Inicializar o jogo ao carregar a página
createColorChips()
initGame()

console.log("[v0] Jogo de Adivinhação de Cores carregado!")