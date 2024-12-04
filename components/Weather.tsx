import { useEffect } from "react";

const WeatherWidget: React.FC = () => {
  useEffect(() => {
    // Créer un élément script pour charger le widget météo de manière asynchrone
    const script = document.createElement("script");
    script.src = "https://app3.weatherwidget.org/js/?id=ww_07ef386ba345";
    script.async = true;
    document.body.appendChild(script);

    // Nettoyage du script lorsque le composant est démonté
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="weather-widget-container">
      {/* Utilisation de dangerouslySetInnerHTML pour permettre des attributs non standards */}
      <div
        id="ww_07ef386ba345"
        // Ces attributs sont spécifiques au widget météo et sont nécessaires pour le bon fonctionnement
        {...{
          v: "1.3",
          loc: "id",
          a: '{"t":"responsive","lang":"en","sl_lpl":1,"ids":["wl11196"],"font":"Arial","sl_ics":"one_a","sl_sot":"celsius","cl_bkg":"image","cl_font":"#FFFFFF","cl_cloud":"#FFFFFF","cl_persp":"#81D4FA","cl_sun":"#FFC107","cl_moon":"#FFC107","cl_thund":"#FF5722"}',
        }}
      >
        <a href="https://weatherwidget.org/" id="ww_07ef386ba345_u" target="_blank">
          Weather widget html
        </a>
      </div>
    </div>
  );
};

export default WeatherWidget;
