import {useState, useEffect, useCallback } from 'react';

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
  return fetch(
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&StationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.Station[0];
      const neededKeys = ['WindSpeed', 'AirTemperature'];

      const weatherElements = Object.entries(locationData.WeatherElement).reduce(
        (neededElements, [key, value]) => {
          if (neededKeys.includes(key)) {
            neededElements[key] = value;
          }
          return neededElements;
        },
        {}
      );

      return {
        observationTime: locationData.ObsTime.DateTime,
        locationName: locationData.StationName,
        temperature: weatherElements.AirTemperature,
        windSpeed: weatherElements.WindSpeed,
      };
  });
};

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
  return fetch(
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
  });
};

export const useWeatherAPI = ({ locationName, cityName, authorizationKey }) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: '',
    temperature: 0,
    windSpeed: 0,
    description: '',
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
      setWeatherElement((prevState) => ({
        ...prevState,
        isLoading: true,
      }));
  
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather({authorizationKey, locationName}),
        fetchWeatherForecast({authorizationKey, cityName}),
      ]);
  
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      });
    }, [authorizationKey, cityName, locationName]);

  useEffect(() => { 
    fetchData() 
  }, [fetchData]);

  return [weatherElement, fetchData]
};