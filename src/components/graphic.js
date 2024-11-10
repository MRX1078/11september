import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// Регистрация компонентов Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function MBTIRadarChart({ parameters }) {
  // Фильтруем только данные MBTI
  const mbtiParameters = parameters.filter(param => param.model === 'MBTI');

  // Настройка данных для графика
  const data = {
    labels: mbtiParameters.map(param => param.parameter), // Параметры для осей
    datasets: [
      {
        label: 'Соответствие',
        data: mbtiParameters.map(param => param.confidence.toFixed(2)), // Значения соответствия
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 1, // Максимум 1, так как confidence в пределах [0, 1]
        ticks: {
          stepSize: 0.2,
        },
      },
    },
  };

  return <Radar data={data} options={options} />;
}

export default MBTIRadarChart;
