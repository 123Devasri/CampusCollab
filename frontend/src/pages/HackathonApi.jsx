import { useEffect, useState } from "react";
import axios from "axios";

const KEY = "a56c8b61b73c4e6a9035c405e857a49b";

function HackathonApi() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=hackathon&sortBy=publishedAt&language=en&apiKey=${KEY}`
      );

      setArticles(response.data.articles);
    } catch (err) {
      console.log(err);
      alert("Error fetching hackathon news");
    }
  };

  return (
    <div>
      <h1>Latest Hackathon News</h1>

      <div>
        {articles.map((article, index) => (
          <div
            key={index}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
            }}
          >
            <h3>{article.title}</h3>

            <p>{article.description}</p>

            <p>
              <b>Source:</b> {article.source.name}
            </p>

            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt="news"
                width="300"
              />
            )}

            <br />

            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
            >
              Read More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HackathonApi;