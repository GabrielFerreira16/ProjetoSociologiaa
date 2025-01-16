var express = require("express");
var router = express.Router();
const Pergunta = require("../models/perguntas"); // Modelo MongoDB

// Função para embaralhar um array (Fisher-Yates Shuffle)
function shuffleArray(array) {
  let shuffled = array.map(value => ({ value, sort: Math.random() })) // Adiciona um valor aleatório
                      .sort((a, b) => a.sort - b.sort) // Ordena aleatoriamente
                      .map(({ value }) => value); // Retorna o array ordenado

  return shuffled;
}

/* GET página inicial do quiz */
router.get("/", async function (req, res, next) {
  try {
    let questions = await Pergunta.find(); // Busca todas as perguntas no MongoDB

    if (!questions.length) {
      return res.render("quiz", {
        title: "Quiz de Sociologia",
        question: null,
        score: 0,
        feedback: "Nenhuma pergunta encontrada no banco de dados.",
      });
    }

    // Embaralha as perguntas
    questions = shuffleArray(questions);

    // Embaralha alternativas da primeira pergunta
    let shuffledOptions = shuffleArray([...questions[0].alternativas]);

    // Encontra a posição da resposta correta após embaralhar
    let correctIndex = shuffledOptions.indexOf(questions[0].respostaCorreta);

    // Renderiza a primeira pergunta embaralhada
    res.render("quiz", {
      title: "Quiz de Sociologia",
      question: {
        question: questions[0].pergunta,
        options: shuffledOptions, // Alternativas embaralhadas
      },
      currentIndex: 0,
      score: 0,
      feedback: null,
      correctIndex, // Passa a posição da resposta correta
    });
  } catch (error) {
    res.status(500).send("Erro ao carregar perguntas: " + error.message);
  }
});

/* POST submissão da resposta */
router.post("/submit", async function (req, res, next) {
  try {
    const questions = await Pergunta.find();
    const currentIndex = parseInt(req.body.index);
    const userAnswerIndex = parseInt(req.body.answerIndex); // Agora recebemos a posição da resposta selecionada
    let score = parseInt(req.body.score) || 0;

    let shuffledOptions = shuffleArray([...questions[currentIndex].alternativas]); // Mantemos a ordem embaralhada
    let correctAnswer = questions[currentIndex].respostaCorreta;
    let correctIndex = shuffledOptions.indexOf(correctAnswer); // Posição da resposta correta

    console.log(correctIndex);
    
    let feedback, feedbackClass;
    if (userAnswerIndex === correctIndex) {
      feedback = "Correto! Boa resposta!";
      feedbackClass = "correct-feedback";
      score++;
    } else {
      feedback = `Incorreto! A resposta certa é: "${correctAnswer}".`;
      feedbackClass = "incorrect-feedback";
    }

    res.render("quiz", {
      title: "Quiz de Sociologia",
      question: {
        question: questions[currentIndex].pergunta,
        options: shuffledOptions,
      },
      currentIndex,
      score,
      feedback,
      feedbackClass,
      correctIndex,
    });
  } catch (err) {
    next(err);
  }
});

/* POST avançar para próxima pergunta */
router.post("/next", async function (req, res, next) {
  try {
    const questions = await Pergunta.find();
    const currentIndex = parseInt(req.body.index);
    const score = parseInt(req.body.score);

    if (currentIndex + 1 < questions.length) {
      // Embaralha as alternativas da próxima pergunta
      let shuffledOptions = shuffleArray([...questions[currentIndex + 1].alternativas]);
      let correctIndex = shuffledOptions.indexOf(questions[currentIndex + 1].respostaCorreta);

      res.render("quiz", {
        title: "Quiz de Sociologia",
        question: {
          question: questions[currentIndex + 1].pergunta,
          options: shuffledOptions,
        },
        currentIndex: currentIndex + 1,
        score,
        feedback: null,
        correctIndex,
      });
    } else {
      res.render("quiz", {
        title: "Quiz de Sociologia",
        question: null,
        score,
        questions,
        feedback: "Fim do quiz! Seu total de pontos foi: " + score,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
