import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function TableCustomers() {
  const [customers, setCustomers] = useState([]);
  const [customersBackup, setCustomersBackup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [typeDocList, setTypeDocList] = useState([]);
  //const url ='https://rios-company.onrender.com';
  const url = 'http://127.0.0.1:8000/api';
  const classThTable = "border border-white px-2 py-1"
  console.log(typeDocList, "typeDocList")
  function searchApi(searchValue: string) {
    setLoadingSearch(true);
    axios.get(url + '/customer?doc_number=' + searchValue)  // Cambia esta URL por la de tu API real
      .then(response => {
        console.log(response);
        setCustomers(response.data);

        setLoadingSearch(false);
      })
      .catch(error => {
        console.error('Error al obtener clientes:', error);
        setLoading(false);
      }).finally(() => {
        setLoadingSearch(false);
      })

  }
  // ...existing code...
  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Evita el submit por defecto
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('doc_number') as string;
 
    if (searchValue === '') {
      setCustomers(customersBackup);
    } else {
      searchApi(searchValue);
    }
  }
  function handleTypeDocChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedTypeDoc = e.target.value;
    console.log(selectedTypeDoc)
    if (selectedTypeDoc === '') {
      setCustomers(customersBackup);
    } else {
      axios.get(url + '/customer?doc_type_name=' + selectedTypeDoc)  // Cambia esta URL por la de tu API real
        .then(response => {
          console.log(response);
          setCustomers(response.data);
        })
        .catch(error => {
          console.error('Error al obtener clientes:', error);
          setLoading(false);
        });
    }
  }
  function getCustomers() {
    axios.get(url + '/customer')  // Cambia esta URL por la de tu API real
      .then(response => {
        console.log(response);
        setCustomers(response.data);
        setCustomersBackup(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener clientes:', error);
        setLoading(false);
      });
  }

  function getTypeDocList() {
    axios.get(url + '/document_type')  // Cambia esta URL por la de tu API real
      .then(response => {
        console.log(response);
        setTypeDocList(response.data);
      })
      .catch(error => {
        console.error('Error al obtener clientes:', error);
        setLoading(false);
      });
  }
// ...existing code...
function exportTableToCSV(tableID = '', filename = '') {
  const table = document.getElementById(tableID) as HTMLTableElement | null;
  if (!table) return;

  let csv = [];
  for (let row of Array.from(table.rows)) {
    let rowData = Array.from(row.cells).map(cell =>
      `"${cell.innerText.replace(/"/g, '""')}"`
    );
    csv.push(rowData.join(','));
  }
  const csvString = csv.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename ? filename + '.csv' : 'data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function getReport(){
  try{


   axios({
    url: url + '/report', 
    method: 'GET',
    responseType: 'blob',
  })
  .then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'reporte_compras.xlsx';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link?.parentNode?.removeChild(link);
  })
  .catch((error) => {
    console.error('Error descargando archivo:', error);
  });
  }catch(e){
    console.log(e)
  } 
}
function exportReport(){
getReport()
}


  useEffect(() => {
    getCustomers()
    getTypeDocList();
  }, []);
  return (
    loading ? <p>Loading...</p> : customers.length === 0 ? <p>No hay clientes</p> : <div>

      <div>
        <label htmlFor="doc_number">Número de documento:</label>
        <form onSubmit={handleSearch} className='flex gap-1 items-center mb-3'>
          <input className='border border-white ' type="text" id="doc_number" name="doc_number" required />
          <button className='border border-white' type="submit">Buscar</button>
          <button className='border border-white' type="button" onClick={() => setCustomers(customersBackup)}>Reset</button>
        <button
  className='border border-white'
  type="button"
  onClick={() => exportTableToCSV('rios-table','data-clients')}
>
  Exportar a Excel
</button>
    <button
  className='border border-white'
  type="button"
  onClick={ exportReport}
>
  Reporte en Excel
</button>
        </form>
      </div>
      <div>
        <label htmlFor="tipoDocumento">Tipo de documento:</label>
        <select id="doc_number" name="tipoDocumento" onChange={ handleTypeDocChange} required className='border border-white mb-3 bg-transparent'>
          <option value="">Todos</option>
          {typeDocList.map((typeDoc: any) =>
             <option className='bg-transparent text-black' key={typeDoc.id} value={typeDoc.code}>{typeDoc.name}</option>
             )}


        </select>
      </div>

      {loadingSearch ? <p>Loading...</p> : <table id="rios-table" className="border-collapse border border-white w-full text-white" >
        <thead>
          <tr>
            <th className={classThTable}>Id</th>
            <th className={classThTable}>Nombre</th>
            <th className={classThTable}>Apellido</th>
            <th className={classThTable}>Número Documento</th>
             <th className={classThTable}>Tipo Documento</th>
            <th className={classThTable}>Teléfono</th>
            <th className={classThTable}>Email</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer: any) => (
            <tr key={customer.id}>
              <td className={classThTable}>{customer.id}</td>
              <td className={classThTable}>{customer.first_name}</td>
              <td className={classThTable}> {customer.last_name}</td>
              <td className={classThTable}>{customer.doc_number}</td>
              <td className={classThTable}>{customer.doc_type.name}</td>
              <td className={classThTable}>{customer.phone}</td>
              <td className={classThTable}> {customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}