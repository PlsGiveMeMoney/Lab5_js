d3.select("#showTable")
  .on('click', function() {
    let buttonValue = d3.select(this);
    
    if (buttonValue.property("value") === "Показать таблицу") {
      buttonValue.attr("value", "Скрыть таблицу");
      
      let table = d3.select("div.table").append("table");
      let thead = table.append("thead");
      let tbody = table.append("tbody");
      
      // Заголовки таблицы
      let headerRow = thead.append("tr");
      Object.keys(buildings[0]).forEach(function(column) {
        headerRow.append("th").text(column);
      });
      
      // Строки и ячейки таблицы
      buildings.forEach(function(row) {
        let tableRow = tbody.append("tr");
        Object.keys(row).forEach(function(column) {
          tableRow.append("td").text(row[column]);
        });
      });
      
    } else {
      buttonValue.attr("value", "Показать таблицу");
      
      // Удалить таблицу
      d3.select("div.table")
        .selectAll("table")
        .remove();
    }
  });

function createArrGraph(data, key) {
  let groupObj = d3.group(data, d => d[key]);
  let arrGraph = Array.from(groupObj, ([labelX, values]) => {
    let heights = values.map(d => d['Высота']);
    let minMax = [Math.min(...heights), Math.max(...heights)];
    return { labelX, values: minMax };
  });

  return arrGraph;
}



const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;
 
let svg = d3.select("svg")
 .attr("height", height)
 .attr("width", width);

function drawGraph(data) {
 // значения по оси ОХ 
 const keyX = data.ox.value;
 
 // значения по оси ОУ
 const isMin = data.oy[1].checked;
 const isMax = data.oy[0].checked;
 
   // Проверка на выбор значений по оси OY
  if (!isMin && !isMax) {
    alert("Ошибка: Необходимо выбрать хотя бы одну категорию для оси OY.");
    return; // Прекращаем выполнение функции
  }
 // создаем массив для построения графика
 const arrGraph = createArrGraph(buildings, keyX);
 
 svg.selectAll('*').remove();
 
 // создаем шкалы преобразования и выводим оси
 const [scX, scY] = createAxis(arrGraph, isMin, isMax);

  // определяем тип диаграммы
 const chartType = data.chartType.value;
 
 // рисуем графики в зависимости от типа
 if (chartType === 'scatter') {
  // рисуем точечную диаграмму
  if (isMin) {
   createScatterChart(arrGraph, scX, scY, 0, "blue");
  }
  if (isMax) {
   createScatterChart(arrGraph, scX, scY, 1, "red");
  }
 } else if (chartType === 'bar') {
  // рисуем столбчатую диаграмму
  if (isMin) {
   createBarChart(arrGraph, scX, scY, 0, "blue");
  }
  if (isMax) {
   createBarChart(arrGraph, scX, scY, 1, "red");
  }
 }
}

function createAxis(data, isFirst, isSecond){
 // в зависимости от выбранных пользователем данных по OY 
 // находим интервал значений по оси OY
 let firstRange = d3.extent(data.map(d => d.values[0]));
 let secondRange = d3.extent(data.map(d => d.values[1]));
 let min = firstRange[0];
 let max = secondRange[1];
 // функция интерполяции значений на оси
 let scaleX = d3.scaleBand()
 .domain(data.map(d => d.labelX))
 .range([0, width - 2 * marginX]);
 
 let scaleY = d3.scaleLinear()
 .domain([min * 0.85, max * 1.1 ])
 .range([height - 2 * marginY, 0]); 
 
 // создание осей
 let axisX = d3.axisBottom(scaleX); // горизонтальная
 let axisY = d3.axisLeft(scaleY); // вертикальная
 // отрисовка осей в SVG-элементе
 svg.append("g")
 .attr("transform", `translate(${marginX}, ${height - marginY})`)
 .call(axisX)
 .selectAll("text") // подписи на оси - наклонные
 .style("text-anchor", "end")
 .attr("dx", "-.8em")
 .attr("dy", ".15em")
 .attr("transform", d => "rotate(-45)");
 
 svg.append("g")
 .attr("transform", `translate(${marginX}, ${marginY})`)
 .call(axisY);
 
 return [scaleX, scaleY]
}


function createScatterChart(data, scaleX, scaleY, index, color) {
  const r = 4; // радиус точек
  let ident = (index === 0) ? -r / 2 : r / 2; // сдвиг для разделения мин/макс значений

  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", r)
    .attr("cx", d => scaleX(d.labelX) + scaleX.bandwidth() / 2)
    .attr("cy", d => scaleY(d.values[index]) + ident)
    .attr("transform", `translate(${marginX}, ${marginY})`)
    .style("fill", color);
}

function createBarChart(data, scaleX, scaleY, index, color) {
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => scaleX(d.labelX))
    .attr("y", d => scaleY(d.values[index]))
    .attr("width", scaleX.bandwidth())
    .attr("height", d => height - marginY - scaleY(d.values[index]))
    .attr("transform", `translate(${marginX}, ${marginY})`)
    .style("fill", color);
}

// Определение начальных значений формы
const defaultForm = {
  ox: { value: 'Страна' }, // Значение по умолчанию для оси OX
  oy: [{ checked: true }, { checked: false }], // Значение по умолчанию для оси OY
  chartType: { value: 'scatter' } // Тип диаграммы по умолчанию
};

// Функция, вызываемая при загрузке DOM
document.addEventListener('DOMContentLoaded', (event) => {
  drawGraph(defaultForm);
});
