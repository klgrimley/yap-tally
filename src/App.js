import './App.css';
import {useEffect, useMemo, useState} from "react";


function App() {
  const yapServers = useMemo(() =>
    {
        return [
            {"name": "Al-Sask Region", "url": "https://bmltyap.org/AlSask/upgrade-advisor.php", "jsonp": true},
            {"name": "Arizona Region", "url": "https://arizona-na.org/yap/live/upgrade-advisor.php"},
            {"name": "Australia Region", "url": "https://na.org.au/yap/upgrade-advisor.php"},
            {"name": "Bayou Recovery Area", "url": "https://bmltyap.org/brana/upgrade-advisor.php", "jsonp": true},
            {"name": "Central Atlantic Region", "url": "Https://yap.centralatlanticregionofna.org/upgrade-advisor.php", "jsonp": true},
            {"name": "Connecticut Region", "url": "https://yap.ctna.org/upgrade-advisor.php"},
            {"name": "Esperanza Area", "url": "https://bmltyap.org/esperanza-yap/upgrade-advisor.php", "jsonp": true},
            {"name": "FreeState Region Area", "url": "https://freestatena.org/yap-4.2.8/upgrade-advisor.php"},
            {"name": "Hill Country Area", "url": "https://hillcountryna.org/yap/upgrade-advisor.php", "jsonp": true},
            {"name": "Kentucky", "url": "https://bmlt.bmltky.online/yap/upgrade-advisor.php"},
            {"name": "Louisiana Region", "url": "https://dontuse.org/upgrade-advisor.php"},
            {"name": "Minnesota Region", "url": "https://yap.naminnesota.org/upgrade-advisor.php"},
            {"name": "Mississippi Region", "url": "https://mrscna.net/yap/upgrade-advisor.php", "jsonp": true},
            {"name": "Mountaineer Region", "url": "https://yap.yapmrscna.org/upgrade-advisor.php"},
            {"name": "New England Region", "url": "https://phoneline.nerna.org/yap/upgrade-advisor.php"},
            {"name": "Northern New York Region", "url": "https://yap.nny-na.org/upgrade-advisor.php", "jsonp": true},
            {"name": "Plains States Zonal Forum", "url": "https://pszfna.org/yap/upgrade-advisor.php"},
            {"name": "Quebec Region", "url": "https://yap.membres.naquebec.org/upgrade-advisor.php"},
            {"name": "Region 51", "url": "https://phoneline.region51na.org/upgrade-advisor.php", "jsonp": true},
            {"name": "San Francisco Area", "url": "https://phoneline.sfna.org/upgrade-advisor.php", "jsonp": true},
            {"name": "Show Me Region", "url": "https://missourina.org/yap/upgrade-advisor.php"},
            {"name": "Southeast Texas Area", "url": "https://bmltyap.org/southeastTX-Yap/upgrade-advisor.php", "jsonp": true},
            {"name": "Southeastern Zonal Forum", "url": "https://bmlt.sezf.org/zonal-yap/upgrade-advisor.php?override_service_body_config_id=43"},
            {"name": "Volunteer Region", "url": "https://natennessee.org/yap/upgrade-advisor.php"},
            {"name": "Western States Zonal Forum", "url": "https://bmlt.wszf.org/yap/upgrade-advisor.php"},
        ]
    }, []);

  const [yapServerData, setYapServerData] = useState([]);

  const fetchJsonp = (url) => {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                resolve(data);
            };

            const script = document.createElement('script');
            script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
            script.onerror = function() {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP request failed'));
            };
            document.body.appendChild(script);
        });
    }

  useEffect(() => {
    const fetchData = async () => {
        const responses = await Promise.allSettled(yapServers.map(async server => {
            try {
                if (server.jsonp) {
                    return await fetchJsonp(`${server.url}?format=jsonp`)
                } else {
                    return await fetch(`https://corsproxy.io/?${encodeURIComponent(server.url)}`)
                }
            } catch (error) {
                return { status: 'error', error };
            }
        }));
        const data = await Promise.allSettled(responses.map(response => {
            if (response.status === "fulfilled" && response.value !== null) {
                return response.value
            } else {
                return ""
            }
        }));

        const combinedData = data.map((responseData, index) => ({
            name: yapServers[index].name,
            data: [responseData],
        }));

        setYapServerData(combinedData)
    }

    fetchData()
  }, [yapServers])

  return (
      <div>
          <h2>Yap Tally</h2>
          <table border={1}>
              <thead>
              <tr>
                  <th>Server</th>
                  <th>Version</th>
                  {/* Add more table headers if needed */}
              </tr>
              </thead>
              <tbody>
              {yapServerData.map(({ name, data }) => (
                  data.map((serverData) => (
                      <tr key={name}>
                          <td>{name}</td>
                          <td>{serverData.value !== null && serverData.value.version !== null ? serverData.value.version : ""}</td>
                      </tr>
                  ))
              ))}
              </tbody>
          </table>
      </div>
  );
}

export default App;
