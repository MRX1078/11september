import { Box, Button, VStack, Text, HStack,Select,IconButton, Link, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, useToast } from '@chakra-ui/react';
import Layout from '../../Layout';
import Header from '../Header/Header';
import { useState, useEffect } from 'react';
import Store from '../../store/store';

const store = new Store();


type PersonalityModel = {
  id: string;
  model: string;
  parameter: string;
  confidence: number;
  created_at: string;
  updated_at: string;
};

type Vacancy = {
  id: string;
  title: string;
  description: string;
  salary: number;
  personality_models: PersonalityModel[];
};

type Candidate = {
  id: string;
  personality_models: PersonalityModel[];
  video_link: string;
  resume_link: string;
  created_at: string;
  updated_at: string;
};

type Filter = {
  model: string;
  parameter: string;
  threshold: number;
};



const HRPage = () => {
  const [personalityList, setPersonalityList] = useState([]);
  const [vacancyList, setVacancyList] = useState([]);
  const { isOpen: isAddVacancyOpen, onOpen: onAddVacancyOpen, onClose: onAddVacancyClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('');
  const [threshold, setThreshold] = useState(0);
  const [filters, setFilters] = useState<Filter[]>([]);
  const toast = useToast();
  const [availableParameters, setAvailableParameters] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [personalityRes, vacancyRes] = await Promise.all([
          store.getPersonalityList(10, 0),
          store.getVacancyList(100, 0),
        ]);

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
  
        // Добавляем замоканные данные к personality_models для каждого кандидата
        const sortedPersonalityList = personalityRes
          .map((candidate: Candidate) => ({
            ...candidate,
            personality_models: [
              ...(candidate.personality_models || []),
              ...additionalPersonalityModels
            ]
          }))
          .sort((a: Candidate, b: Candidate) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setPersonalityList(sortedPersonalityList);
        setVacancyList(vacancyRes);
      } catch (err) {
        console.log('Error fetching data', err);
      }
    }

    fetchData();
  }, []);

  const handleSubmitVacancy = async () => {
    try {
      await store.createVacancy(title,description, salary);
      toast({
        title: 'Вакансия успешно создана!',
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
    if (selectedModel) {
      const parameters = new Set<string>();
      personalityList.forEach((candidate: Candidate) => {
        candidate.personality_models.forEach((model: PersonalityModel) => {
          if (model.model === selectedModel) {
            parameters.add(model.parameter);
          }
        });
      });
      // @ts-ignore
      setAvailableParameters(Array.from(parameters));
    } else {
      setAvailableParameters([]);
    }
  }, [selectedModel, personalityList]);

  const handleAddFilter = () => {
    if (selectedModel && selectedParameter && threshold !== null) {
      const newFilter = { model: selectedModel, parameter: selectedParameter, threshold: parseFloat(threshold.toString()) };
      setFilters([...filters, newFilter]);
      setSelectedModel('');
      setSelectedParameter('');
      setThreshold(0);
    }
  };

  const handleRemoveFilter = (index:number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    const filteredList = personalityList.filter((candidate: Candidate) => {
      return filters.every(filter => {
        return candidate.personality_models.some(model => {
          return (
            model.model === filter.model &&
            model.parameter.toLowerCase() === filter.parameter.toLowerCase() &&
            model.confidence >= filter.threshold
          );
        });
      });
    });
    setPersonalityList(filteredList); // Обновляем список кандидатов после применения фильтров
  };


  return (
    <Layout>
      <Header />
      <Box p={6} boxShadow="lg" m="auto" mt={16} mb={10} width="100%">
        <HStack spacing={4} mb={6}>
          <Button colorScheme="teal" onClick={onAddVacancyOpen}>Добавить вакансию</Button>
          <Button colorScheme="blue" onClick={onFilterOpen}>Фильтрация</Button>
        </HStack>

        <Accordion allowToggle width="100%">
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Список кандидатов
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={6} align="stretch">
                {personalityList.length > 0 ? (
                  personalityList.map((candidate:Candidate, index:number) => {
                    // Группируем параметры по моделям OCEAN и MBTI
                    const groupedModels = candidate.personality_models.reduce((acc: any, model: PersonalityModel)  => {
                      if (!acc[model.model]) {
                        acc[model.model] = [];
                      }
                      acc[model.model].push({ parameter: model.parameter, confidence: model.confidence });
                      return acc;
                    }, {});

                    return (
                      <Box key={candidate.id} p={4} border="1px solid #ccc" borderRadius="md" bg="gray.50">
                        <VStack align="flex-start" spacing={4}>
                          <HStack>
                            <Text fontWeight="bold">Кандидат #{index + 1} (ID: {candidate.id})</Text>
                          </HStack>

                          <Box>
                            <Text fontWeight="bold">Модели OCEAN:</Text>
                            {groupedModels['OCEAN'] ? (
                              groupedModels['OCEAN'].map((param: any, idx: number) => (
                                <Badge key={idx} colorScheme="blue" mr={2}>
                                  {param.parameter}: {param.confidence.toFixed(2)}
                                </Badge>
                              ))
                            ) : (
                              <Text>Нет данных для OCEAN</Text>
                            )}
                          </Box>

                          <Box>
  <Text fontWeight="bold">Модели MBTI:</Text>
  {groupedModels['MBTI'] ? (
    <>
      {/* Отображаем параметры MBTI */}
      {groupedModels['MBTI'].map((param: any, idx: number) => (
        <Badge key={idx} colorScheme="green" mr={2}>
          {param.parameter}: {param.confidence.toFixed(2)}
        </Badge>
      ))}
      
      {/* Замоканный тип личности */}
      <Text mt={2} fontWeight="bold">
        Тип личности: <Badge colorScheme="blue">INTJ</Badge>
      </Text>
    </>
  ) : (
    <Text>Нет данных для MBTI</Text>
  )}
</Box>

                          <Box>
                            <Text fontWeight="bold">Видео:</Text>
                            <video controls style={{ maxWidth: '100%', maxHeight: '300px' }}>
                              <source src={candidate.video_link} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </Box>

                          <Box>
                            <Text fontWeight="bold">Резюме:</Text>
                            <Link href={candidate.resume_link} target="_blank" rel="noopener noreferrer">
                              <Button colorScheme="teal">Скачать резюме</Button>
                            </Link>
                          </Box>
                        </VStack>
                      </Box>
                    );
                  })
                ) : (
                  <Text>Нет данных для отображения</Text>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Список вакансий
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={6} align="stretch">
                {vacancyList.length > 0 ? (
                  vacancyList.map((vacancy:Vacancy, index) => (
                    <Box key={vacancy.id} p={4} border="1px solid #ccc" borderRadius="md" bg="gray.50">
                      <VStack align="flex-start" spacing={4}>
                        <HStack>
                          <Text fontWeight="bold">Вакансия #{index + 1} (ID: {vacancy.id})</Text>
                        </HStack>
                        <Box>
                          <Text fontWeight="bold">Название:</Text>
                          <Text>{vacancy.title}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Описание:</Text>
                          <Text>{vacancy.description}</Text>
                        </Box>
                      </VStack>
                    </Box>
                  ))
                ) : (
                  <Text>Нет данных для отображения</Text>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>

      {/* Modal for Adding Vacancy */}
      <Modal isOpen={isAddVacancyOpen} onClose={onAddVacancyClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавить вакансию</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Input placeholder="Название вакансии"  value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Описание вакансии" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input type="number" placeholder="Зарплата" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitVacancy}>
              Сохранить
            </Button>
            <Button variant="ghost" onClick={onAddVacancyClose}>Отмена</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Filtering */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Фильтрация кандидатов</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Select placeholder="Выберите модель" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              <option value="OCEAN">OCEAN</option>
              <option value="MBTI">MBTI</option>
              <option value="RIASEC">RIASEC</option>
            </Select>
            <Select placeholder="Выберите параметр" value={selectedParameter} onChange={(e) => setSelectedParameter(e.target.value)}>
              {availableParameters.map((param, idx) => (
                <option key={idx} value={param}>{param}</option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Введите значение порога"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
            <Button colorScheme="blue" onClick={handleAddFilter}>
              Добавить в фильтр
            </Button>
            {filters.length > 0 && (
              <VStack align="stretch" spacing={2} mt={4}>
                <Text fontWeight="bold">Добавленные фильтры:</Text>
                {filters.map((filter, index) => (
                  <HStack key={index} spacing={2}>
                    <Badge colorScheme="purple">{filter.model}</Badge>
                    <Badge colorScheme="teal">{filter.parameter}</Badge>
                    <Badge colorScheme="orange">{`> ${filter.threshold}`}</Badge>
                    <IconButton
                      size="sm"
                      onClick={() => handleRemoveFilter(index)}
                      aria-label="Удалить фильтр"
                    />
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={() => applyFilters()}>
            Применить фильтр
          </Button>
          <Button variant="ghost" onClick={onFilterClose}>Отмена</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </Layout>
  );
};

export default HRPage;
