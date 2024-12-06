import React, { useState } from "react";

import axios from "axios";

const Recipies = () => {
  const [status, setStatus] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Brazilian");
  const [recipeList, setRecipeList] = useState([]);
  const [selectedLang, setSelectedLang] = useState("pt-BR");

  const pantryItems = ["Leite", "Ovos", "Farinha de trigo", "Fermento", "Manteiga"];

  const retrieve = async () => {

    try {

      const queryParams = {};
      if (selectedStyle) queryParams.style = selectedStyle;
      if (selectedLang) queryParams.language = selectedLang;

      const resposta = await axios.post("http://localhost:5001/api/recipies", { pantryItems }, { params: queryParams });
      
      setRecipeList(JSON.parse(resposta.data.result));
      setStatus(resposta.data.status);
      console.log(resposta);
      
    } catch (error) {
      console.error("Error:", error);
    }

  };

  return (
    <div style={{ border: "2px red solid" }}>
      <h3>Receitas</h3>
      <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
        <option value="brazilian">Brazilian</option>
        <option value="indian">Indian</option>
        <option value="italian">Italian</option>
      </select>
      <select value={selectedLang} onChange={(event) => setSelectedLang(event.target.value)}>
        <option value="pt-BR">pt-BR</option>
        <option value="en-US">en-US</option>
        <option value="de-DE">de-DE</option>
      </select>
      <button onClick={retrieve} style={{ marginLeft: 10 }}>Buscar</button>
      {recipeList?.map(r => (<div style={{ direction: "vertical" }}><p>Title: {r.title} </p> <p>Detail: {r.detail}</p></div>))}
      <p>Status: {status}</p>

    </div>
  );
};

export default Recipies;
