import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import moment from "moment";
import "./App.css";
function App() {
  interface currentWeather {
    name: string;
    main: string;
    temp_max: number;
    feels_like: number;
    description: string;
    id: number;
  }

  interface forecastWeather {
    day: string;
    date: number;
    id: number;
    main: string;
    description: string;
    temp_max: number;
  }

  const [city, setCity] = useState([]);
  const [options, setOptions] = useState([]);
  const [current_weather, setCurrent_weather] = useState<currentWeather>(null);
  const [forecast_weather, setForecast_weather] = useState<forecastWeather[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const capitalizeFirstLetter = (string:string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const nth = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  useEffect(() => {
    axios
      .get("../cities-fr.json")
      .then(function (response) {
        let data = [];
        response.data.forEach((d: any) => {
          data.push({ value: d.id, label: d.nm });
        });
        setOptions(data);
        setCity(data[0].value);
        handleOnChange({ label: data[0].label });
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(city).length > 0) {
      setIsLoading(true);
      axios
        .all([
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=18779931dba6c5d8e6c9cac52c1c2f90&units=metric`
          ),
          axios.get(
            `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=3&appid=18779931dba6c5d8e6c9cac52c1c2f90&units=metric`
          ),
        ])
        .then(
          axios.spread((currentRes, forecastRes) => {
            if (currentRes?.data && currentRes?.status === 200) {
              let currentR: currentWeather = {
                id: currentRes.data.weather[0].id,
                name: currentRes.data.name,
                main: currentRes.data.weather[0].main,
                temp_max: currentRes.data.main.temp_max,
                feels_like: currentRes.data.main.feels_like,
                description: capitalizeFirstLetter(currentRes.data.weather[0].description),
              };
              setCurrent_weather(currentR);
            }

            if (forecastRes?.data && forecastRes?.status === 200) {
              let forecastArr: forecastWeather[] = [];
              forecastRes?.data?.list?.forEach((forecastResI: any, key: number) => {
                let date = moment().add(key + 1, "days");
                let forecastR: forecastWeather = {
                  day: date.format("ddd"),
                  date: date.date(),
                  id: forecastResI.weather[0].id,
                  main: forecastResI.weather[0].main,
                  description: capitalizeFirstLetter(forecastResI.weather[0].description),
                  temp_max: forecastResI.temp.max,
                };
                forecastArr.push(forecastR);
              });
              setForecast_weather(forecastArr);
            }
          })
        )
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [city]);

  const handleOnChange = (e:any) => {
    setCity(e.label);
  };

  return (
    <div className="container">
      <div className="hero is-full-screen">
        <div className="app is-center">
          <div className="card">
            <header>
              <Select options={options} onChange={handleOnChange} />
            </header>
            <>
              {isLoading && (
                <section id="loader" className="is-center text-center">
                  <div className="spinner"></div>
                </section>
              )}
            </>
            <>
              {!isLoading &&
                current_weather != null &&
                Object.keys(forecast_weather).length > 0 && (
                  <>
                    <section>
                      <div className="row is-vertical-align">
                        <div className="col-5 text-center">
                          <i
                            className={"wi large wi-icon-" + current_weather.id}
                          ></i>
                        </div>
                        <div className="col-7 text-left">
                          <p>
                            <strong style={{ fontSize: "24px" }}>
                              {current_weather.name}
                            </strong>
                            <br />
                            {current_weather.main} {current_weather.temp_max}°
                            <br />
                            {current_weather.description}, feels like{" "}
                            {current_weather.feels_like}°
                          </p>
                        </div>
                        `
                      </div>
                    </section>

                    <section>
                      <div className="row is-vertical-align text-center is-center">
                        {forecast_weather.map(
                          (forecastWeather: forecastWeather, key: number) => {
                            return (
                              <div className="col-4" key={key}>
                                <div className="col-12">
                                  <h4>
                                    {forecastWeather.day} {forecastWeather.date}<sup>{nth(forecastWeather.date)}</sup>
                                    <sup></sup>
                                  </h4>
                                </div>
                                <div className="col-12">
                                  <i
                                    className={
                                      "wi small wi-icon-" + forecastWeather.id
                                    }
                                  ></i>
                                </div>
                                <div className="col-12">
                                  <p>
                                    {forecastWeather.main}{" "}
                                    {forecastWeather.temp_max}°
                                    <br />
                                    {forecastWeather.description}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </section>
                  </>
                )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
