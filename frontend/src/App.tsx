import { useEffect, useState } from 'react';

function App() {
  const [estado, setEstado] = useState('a verificar...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((dados) =>
        setEstado(
          dados.status === 'ok' && dados.db === 'ok'
            ? 'API e base de dados OK'
            : 'Erro na API',
        ),
      )
      .catch(() => setEstado('API indisponível'));
  }, []);

  return (
    <main>
      <h1>God’s Eye</h1>
      <p data-testid="estado-api">{estado}</p>
    </main>
  );
}

export default App;
