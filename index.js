var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
var targetURL = "http://10.0.0.1/network_setup.jst";

function redirectIfNeeded(targetURL) {
  if (window.location.href !== targetURL) {
    console.log("Redirecting to the network setup page...");
    window.location.href = targetURL;
    return false;
  }
  return true;
}

function tableToArray(table) {
  let data = [];
  let rows = table.querySelectorAll("tbody tr");

  for (let row of rows) {
    let rowData = [];
    let cells = row.querySelectorAll("th, td");
    for (let cell of cells) {
      rowData.push(cell.innerText.trim());
    }
    data.push(rowData);
  }
  return data;
}

function transposeArray(array) {
  return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

function arrayToCSV(dataArray) {
  var csv = dataArray.map((item) => {
    var row = item;
    return row.join(",");
  }).join("\n");

  return csv;
}

function downloadCSV(data, filename) {
  let blob = new Blob([data], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processTables(transpose) {
  let tables = document.querySelectorAll("table.data");

  for (const [index, table] of tables.entries()) {
    let headerText = table.querySelector("thead tr td")?.innerText.toLowerCase().trim();

    let tableData = tableToArray(table);
    if (transpose) {tableData = transposeArray(tableData);}
    let csvData = arrayToCSV(tableData);

    if (headerText.includes("downstream")) {
      downloadCSV(csvData, `downstream_${timestamp}.csv`);
    } else if (headerText.includes("upstream")) {
      downloadCSV(csvData, `upstream_${timestamp}.csv`);
    } else if (headerText.includes("error")) {
      downloadCSV(csvData, `errors_${timestamp}.csv`);
    } else {
      downloadCSV(csvData, `table_${index + 1}_${timestamp}.csv`);
    }
    await sleep(100);
  };
}

if (redirectIfNeeded(targetURL)) {
  processTables(true);
}
