import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { WeatherCard } from './views/WeatherCard';
import { WeatherSetting } from './views/WeatherSetting';
import { useWeatherAPI } from './hooks/useWeatherAPI';
import { getMoment, findLocation } from './utils/helpers';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = process.env.REACT_APP_WEATHER_API_AUTHORIZATION_KEY;

const App = () => {
  console.log('--- invoke function component ---');
  
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentCity, setCurrentCity] = useState(() => localStorage.getItem('cityName') || '臺北市');
  const [currentPage, setCurrentPage] = useState('WeatherCard');

  const currentLocation = useMemo(() => findLocation(currentCity), [currentCity]);

  const {cityName, locationName, sunriseCityName } = currentLocation;

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  });

  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName]);

  useEffect(() => {
    setCurrentTheme((moment === 'day') ? 'light' : 'dark')
  }, [moment]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {(currentPage === 'WeatherCard') && (
          <WeatherCard 
            cityName={cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}

        {(currentPage === 'WeatherSetting') && (
          <WeatherSetting 
            cityName={cityName}
            setCurrentPage={setCurrentPage}
            setCurrentCity={setCurrentCity}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;