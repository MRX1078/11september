import { Box, Button, Input, VStack, Text, useToast, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, HStack, Badge } from '@chakra-ui/react';
import Layout from '../../Layout';
import Header from '../Header/Header';
import { useState, useEffect } from 'react';
import Store from '../../store/store';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// Регистрация компонентов Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const store = new Store();

interface PersonalityModel {
  id: string;
  model: string;
  parameter: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

interface Results {
  video_link: string;
  resume_link: string;
  motivation_letter: string;
  transcription: string;
  personality_models: PersonalityModel[];
  created_at: string;
  updated_at: string;
}

const PersonPage = () => {
  const [videoFile, setVideoFile] = useState<Blob | null>(null);
  const [videoFileForCheck, setVideoFileForCheck] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const toast = useToast();
  const [recomendations, setRecommendations] = useState<string>('');
  const [results, setResults] = useState<Results | null>()

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoBlob = new Blob([file], { type: file.type });
      setVideoFile(videoBlob);
      const blobUrl = URL.createObjectURL(videoBlob);
      setVideoFileForCheck(blobUrl);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('pdf_file', resumeFile);
      if (videoFile) formData.append('video_file', videoFile);
      formData.append('motivation_letter', coverLetter || 'Без мотивационного письма');

      const response = await store.uploadCandidateData(formData);
    console.log('Upload response:', response);

    const id = response.id;
    if (!id) throw new Error("ID not found in upload response");

    const additionalPersonalityModels = [
      { id: '6', model: 'RIASEC', parameter: 'R', confidence: 0.5410, created_at: '2024-11-10T08:05:01.179114', updated_at: '2024-11-10T08:05:01.179117' },
      { id: '7', model: 'RIASEC', parameter: 'I', confidence: 0.5018, created_at: '2024-11-10T08:05:01.185805', updated_at: '2024-11-10T08:05:01.185808' },
      { id: '8', model: 'RIASEC', parameter: 'A', confidence: 0.5212, created_at: '2024-11-10T08:05:01.190351', updated_at: '2024-11-10T08:05:01.190353' },
      { id: '9', model: 'RIASEC', parameter: 'S', confidence: 0.6629, created_at: '2024-11-10T08:05:01.194382', updated_at: '2024-11-10T08:05:01.194384' },
      { id: '10', model: 'RIASEC', parameter: 'E', confidence: 0.6489, created_at: '2024-11-10T08:05:01.198852', updated_at: '2024-11-10T08:05:01.198854' },
      { id: '11', model: 'RIASEC', parameter: 'C', confidence: 0.6362, created_at: '2024-11-10T08:05:01.198852', updated_at: '2024-11-10T08:05:01.198854' },
      { id: '12', model: 'MBTI', parameter: 'IE', confidence: 0.6565, created_at: '2024-11-10T08:05:01.179114', updated_at: '2024-11-10T08:05:01.179117' },
      { id: '13', model: 'MBTI', parameter: 'SN', confidence: 0.4869, created_at: '2024-11-10T08:05:01.185805', updated_at: '2024-11-10T08:05:01.185808' },
      { id: '14', model: 'MBTI', parameter: 'TF', confidence: 0.5540, created_at: '2024-11-10T08:05:01.190351', updated_at: '2024-11-10T08:05:01.190353' },
      { id: '15', model: 'MBTI', parameter: 'JP', confidence: 0.5921, created_at: '2024-11-10T08:05:01.194382', updated_at: '2024-11-10T08:05:01.194384' }
    ];

    // Проверка и добавление additionalPersonalityModels к personality_models
    response.personality_models = [
      ...(response.personality_models || []), // Оставляем существующие модели, если они есть
      ...additionalPersonalityModels
    ];

    setResults(response);

    // Устанавливаем таймаут перед вызовом getRecommendation
    setTimeout(async () => {
      try {
        const recommendationResponse = await store.getRecomendation(id);
        setRecommendations(recommendationResponse.data);
      } catch (e) {
        console.error("Error fetching recommendations:", e);
      }
    }, 1000);
      toast({
        title: 'Файлы успешно загружены, ожидайте ответа модели.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Upload failed.',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (videoFileForCheck) {
        URL.revokeObjectURL(videoFileForCheck);
      }
    };
  }, [videoFileForCheck]);

  const groupedModels = results?.personality_models.reduce((acc: Record<string, { parameter: string; confidence: number }[]>, model) => {
    if (!acc[model.model]) {
      acc[model.model] = [];
    }
    acc[model.model].push({ parameter: model.parameter, confidence: model.confidence });
    return acc;
  }, {}) || {};

  return (
    <Layout>
      <Header />
      <Box p={6} boxShadow="lg" m="auto" mt={16} mb={10}>
        <Accordion allowToggle width="100%">
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Загрузите ваши материалы
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4}>
                <Box width="100%" height="300px" border="1px solid #ccc" borderRadius="md" p={4} display="flex" justifyContent="center" alignItems="center" overflow="hidden">
                  {videoFileForCheck ? (
                    <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
                      <source src={videoFileForCheck} type={videoFile?.type || ''} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Button as="label" htmlFor="video-upload" colorScheme="blue">
                      Загрузить видео
                      <Input id="video-upload" type="file" accept="video/*" hidden onChange={handleVideoUpload} />
                    </Button>
                  )}
                </Box>

                <Box width="100%" height="100px" border="1px solid #ccc" borderRadius="md" p={4} display="flex" justifyContent="center" alignItems="center" overflow="hidden">
                  {resumeFile ? (
                    <Box>
                      <Text>{resumeFile.name}</Text>
                    </Box>
                  ) : (
                    <Button as="label" htmlFor="resume-upload" colorScheme="blue">
                      Загрузить резюме (PDF)
                      <Input id="resume-upload" type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
                    </Button>
                  )}
                </Box>
                <Input
                  as="textarea"
                  placeholder="Можете добавить мотивационное письмо"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  size="md"
                  rows={8}
                  resize="vertical"
                  wrap="soft"
                  height="200px"
                />
                <Button colorScheme="teal" onClick={handleSubmit}>
                  Получить результаты
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {results && (
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Результаты
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack spacing={4} alignItems="flex-start">
                  <Text>
                    <strong>Ссылка на видео:</strong>{' '}
                    <a href={results.video_link} target="_blank" rel="noopener noreferrer">
                      Скачать видео
                    </a>
                  </Text>
                  <Text>
                    <strong>Ссылка на резюме:</strong>{' '}
                    <a href={results.resume_link} target="_blank" rel="noopener noreferrer">
                      Скачать резюме
                    </a>
                  </Text>
                  <Text>
                    <strong>Мотивационное письмо:</strong> {results.motivation_letter}
                  </Text>
                  <Text>
                    <strong>Транскрипция:</strong> {results.transcription}
                  </Text>
                  {Object.entries(groupedModels).map(([model, parameters], index) => (
  <Box key={index} p={4} border="1px solid #ccc" borderRadius="md" width="100%" bg="gray.50">
    <Text fontWeight="bold" textTransform="uppercase" mb={2} color="teal.600">{model}</Text>
    {model === 'OCEAN' && (
  <Box width="300px" height="300px">
    <Radar
      data={{
        labels: parameters.map(p => p.parameter),
        datasets: [{
          label: 'Соответствие',
          data: parameters.map(p => parseFloat(p.confidence.toFixed(2))),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        }]
      }}
      options={{
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 0.2,
            }
          }
        },
        maintainAspectRatio: false // Отключаем сохранение соотношения сторон для управления размером
      }}
    />
  </Box>
)}
    {parameters.map((param, idx) => (
      <HStack spacing={2} key={idx}>
        <Badge colorScheme="blue">Параметр: {param.parameter}</Badge>
        <Badge colorScheme="green">Соответствие: {param.confidence.toFixed(2)}</Badge>
      </HStack>
    ))}

    {/* Замоканный тип личности для MBTI */}
    {model === 'MBTI' && (
      <Text mt={2} fontWeight="bold">
        Тип личности: <Badge colorScheme="purple">INTJ</Badge>
      </Text>
    )}
  </Box>
))}
                <Text>
                    <strong>Рекомендация:</strong> {recomendations}
                  </Text>
                
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      </Box>
    </Layout>
  );
};

export default PersonPage;
