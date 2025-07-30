import BloqueFiltro from "../../components/filtros/bloqueFiltro/BloqueFiltros";
import BloqueAlojamiento from "../../components/bloqueAlojamientos/bloqueAlojamientos";
import { useState, useEffect } from "react";
import { getAlojamientos } from "../../api/api.js";
import { IconButton, Typography } from "@material-tailwind/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filtros, setFiltros] = useState({
    ciudad: null,
    fechaEntrada: null,
    fechaSalida: null,
    cantidadHuespedes: 1,
    precioMax: null,
    caracteristicas: null,
  });
  const [alojamientosPagina, setAlojamientosPagina] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarAlojamientos();
  }, [pageNumber, filtros]);

  const cargarAlojamientos = async () => {
    try {
      setLoading(true);

      const start = Date.now(); // tiempo de inicio real
      const response = await getAlojamientos(pageNumber, filtros);

      setAlojamientosPagina(response.data);
      setTotalPages(response.total_pages);
      if (response.page !== pageNumber) {
        setPageNumber(response.page);
      }

      const elapsed = Date.now() - start;
      const delay = Math.max(0, 800 - elapsed); // mínimo 800ms de loader visible

      setTimeout(() => setLoading(false), delay);
    } catch (error) {
      console.error("Algo salió mal al cargar alojamientos", error);
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNext = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <>
      <BloqueFiltro
        filtros={filtros}
        setFiltros={setFiltros}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />

      <div className="flex items-center justify-center pt-10 bg-black relative z-10">
        {/* Flechas en desktop - solo visible en pantallas medianas y grandes */}
        <div className="hidden md:flex w-20 items-center justify-center h-full px-2">
          {pageNumber > 1 && (
            <IconButton
              size="sm"
              variant="outlined"
              onClick={handlePrevious}
              className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-800 mx-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-black max-w-6xl w-full px-2 flex-1 min-h-[200px] justify-center items-center">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-300"></div>
            </div>
          ) : (
            alojamientosPagina.map((alojamiento) => (
              <BloqueAlojamiento
                key={alojamiento.id}
                alojamiento={alojamiento}
              />
            ))
          )}
        </div>

        {/* Flechas en desktop - solo visible en pantallas medianas y grandes */}
        <div className="hidden md:flex w-20 items-center justify-center h-full px-2">
          {pageNumber < totalPages && (
            <IconButton
              size="sm"
              variant="outlined"
              onClick={handleNext}
              className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-800 mx-2"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Flechas en móvil - solo visible en pantallas pequeñas */}
      <div className="flex md:hidden justify-center items-center gap-4 py-4 bg-black">
        {pageNumber > 1 && (
          <IconButton
            size="sm"
            variant="outlined"
            onClick={handlePrevious}
            className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </IconButton>
        )}
        
        <Typography variant="small" color="white" className="mx-4">
          Página {pageNumber} de {totalPages}
        </Typography>

        {pageNumber < totalPages && (
          <IconButton
            size="sm"
            variant="outlined"
            onClick={handleNext}
            className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </IconButton>
        )}
      </div>

      {/* Información de página en desktop */}
      <div className="hidden md:flex justify-center py-4 bg-black">
        <Typography variant="small" color="white">
          Página {pageNumber} de {totalPages}
        </Typography>
      </div>
    </>
  );
};

export default Home;
