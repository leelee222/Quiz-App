import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Container,
  Grid,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: 'auto',
  marginTop: theme.spacing(2)
}));

const OptionButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textAlign: 'left',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  width: '100%'
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2)
}));

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('loading');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch('https://api.allorigins.win/get?url=https://api.jsonserve.com/Uw5CrX');
        const data = await response.json();
        const quizData = JSON.parse(data.contents);
        console.log(quizData);
        setQuizData(quizData);
        setTimeRemaining(data.duration * 60);
        setGameState('start');
      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
        setGameState('error');
      }
    };

    fetchQuizData();
  }, []);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  const startQuiz = () => {
    setGameState('playing');
    setScore(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setMistakeCount(0);
    setTimeRemaining(quizData.duration * 60);
  };

  const handleAnswer = (selectedOption) => {
    const correct_marks = parseFloat(quizData.correct_answer_marks);
    const negative_marks = parseFloat(quizData.negative_marks);
    
    const isCorrect = selectedOption.is_correct;
    const newScore = isCorrect 
      ? score + correct_marks 
      : score - negative_marks;
    
    setScore(Math.max(0, newScore));
    
    if (!isCorrect) {
      setMistakeCount(prev => prev + 1);
      if (mistakeCount + 1 >= quizData.max_mistake_count) {
        setGameState('results');
        return;
      }
    }

    setAnswers(prev => [...prev, {
      question: currentQuestion,
      selected: selectedOption,
      isCorrect
    }]);

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setGameState('results');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (gameState === 'error') {
    return (
      <StyledCard>
        <CardContent>
          <Box textAlign="center">
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Failed to load quiz
            </Typography>
            <Typography color="textSecondary" paragraph>
              Please try again later.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <Container>
      <StyledCard>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            {gameState === 'start' && quizData.title}
            {gameState === 'playing' && quizData.topic}
            {gameState === 'results' && "Quiz Complete!"}
          </Typography>

          {gameState === 'start' && (
            <Box>
              <Paper elevation={0} sx={{ bgcolor: 'primary.light', p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quiz Information:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Correct Answer: +${quizData.correct_answer_marks} points`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CancelIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Wrong Answer: -${quizData.negative_marks} points`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Time Limit: ${quizData.duration} minutes`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Questions: ${quizData.questions_count}`} 
                    />
                  </ListItem>
                </List>
              </Paper>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={startQuiz}
                size="large"
              >
                Start Quiz
              </Button>
            </Box>
          )}

          {gameState === 'playing' && (
            <Box>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Box display="flex" alignItems="center">
                    <TimerIcon sx={{ mr: 1 }} />
                    <Typography>{formatTime(timeRemaining)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <TrophyIcon sx={{ mr: 1 }} color="primary" />
                    <Typography>Score: {score}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <Typography>
                      Question {currentQuestion + 1}/{quizData.questions.length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <LinearProgress 
                variant="determinate" 
                value={((currentQuestion + 1) / quizData.questions.length) * 100}
                sx={{ mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>
                {quizData.questions[currentQuestion].description}
              </Typography>

              <Box sx={{ mt: 2 }}>
                {quizData.questions[currentQuestion].options.map((option) => (
                  <OptionButton
                    key={option.id}
                    variant="outlined"
                    onClick={() => handleAnswer(option)}
                  >
                    {option.description}
                  </OptionButton>
                ))}
              </Box>
            </Box>
          )}

          {gameState === 'results' && (
            <Box>
              <IconWrapper>
                <TrophyIcon color="primary" sx={{ fontSize: 64 }} />
              </IconWrapper>
              
              <Typography variant="h5" align="center" gutterBottom>
                Final Score: {score}
              </Typography>
              
              <Typography align="center" color="textSecondary" gutterBottom>
                Correct Answers: {answers.filter(a => a.isCorrect).length} / {quizData.questions.length}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mt: 3 }}>
                {answers.map((answer, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: answer.isCorrect ? 'success.light' : 'error.light'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {quizData.questions[index].description}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Your answer: {answer.selected.description}
                    </Typography>
                    {!answer.isCorrect && quizData.show_answers && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">
                          Solution:
                        </Typography>
                        <Typography variant="body2">
                          {quizData.questions[index].detailed_solution}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>

              <Button 
                variant="contained" 
                fullWidth 
                onClick={startQuiz}
                size="large"
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default QuizApp;