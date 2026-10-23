import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ejemplar, Sexo, EstadoReproductivo, EstadoEjemplar, CalificacionDisplasiaCadera, CalificacionDisplasiaCodo } from '../../types';
import { X, Dog, Save, Image, Check, Upload, Camera, CheckCircle2, Loader2, Trash2, Cloud, Globe, ExternalLink, Download, AlertTriangle, FileText } from 'lucide-react';
import { uploadDogPhoto } from '../../lib/firebase';

interface DogFormModalProps {
  dog?: Ejemplar | null;
  onClose: () => void;
}

export const DogFormModal: React.FC<DogFormModalProps> = ({ dog, onClose }) => {
  const { addEjemplar, updateEjemplar, currentCriaderoId, currentCriadero, parsePedigreeDatabaseUrl } = useApp();

  const [activeFormTab, setActiveFormTab] = useState<'DATOS' | 'GENEALOGIA' | 'SANIDAD'>('DATOS');

  // Form states
  const [nombreCompleto, setNombreCompleto] = useState(dog?.nombreCompleto || '');
  const [afijo, setAfijo] = useState(dog?.afijo || currentCriadero?.afijo || '');
  const [sexo, setSexo] = useState<Sexo>(dog?.sexo || 'MACHO');
  const [raza, setRaza] = useState(dog?.raza || 'Ovejero Alemán (Pastor Alemán)');
  const [fechaNacimiento, setFechaNacimiento] = useState(dog?.fechaNacimiento || '2023-01-01');
  const [numeroPOA, setNumeroPOA] = useState(dog?.numeroPOA || '');
  const [microchip, setMicrochip] = useState(dog?.microchip || '');
  const [tatuaje, setTatuaje] = useState(dog?.tatuaje || '');
  const [identificacionInterna, setIdentificacionInterna] = useState(dog?.identificacionInterna || '');
  const [color, setColor] = useState(dog?.color || 'Negro y Fuego');
  const [pelo, setPelo] = useState<'CORTO' | 'LARGO' | 'MEDIO'>(dog?.pelo || 'CORTO');
  const [estadoReproductivo, setEstadoReproductivo] = useState<EstadoReproductivo>(dog?.estadoReproductivo || 'ACTIVO');
  const [estado, setEstado] = useState<EstadoEjemplar>(dog?.estado || 'ACTIVO');
  const [fotoUrl, setFotoUrl] = useState(dog?.fotoUrl || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<'storage' | 'local' | 'external'>(
    dog?.fotoUrl ? (dog.fotoUrl.includes('firebasestorage') ? 'storage' : 'external') : 'external'
  );
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Pedigree Document (PDF or Image)
  const [pedigreeDocUrl, setPedigreeDocUrl] = useState(dog?.pedigreeDocUrl || '');
  const [pedigreeDocNombre, setPedigreeDocNombre] = useState(dog?.pedigreeDocNombre || '');
  const [pedigreeDocTipo, setPedigreeDocTipo] = useState<'PDF' | 'IMAGEN' | undefined>(dog?.pedigreeDocTipo);
  const [pedigreeDocSize, setPedigreeDocSize] = useState(dog?.pedigreeDocSize || '');
  const [pedigreeDocFecha, setPedigreeDocFecha] = useState(dog?.pedigreeDocFecha || '');

  // PedigreeDatabase.com integration state
  const [pedigreeDatabaseUrl, setPedigreeDatabaseUrl] = useState(dog?.pedigreeDatabaseUrl || '');
  const [isFetchingPedigreeDb, setIsFetchingPedigreeDb] = useState(false);
  const [pedigreeDbSuccess, setPedigreeDbSuccess] = useState<string | null>(null);
  const [pedigreeDbError, setPedigreeDbError] = useState<string | null>(null);

  // Pedigree fields
  const [padreNombre, setPadreNombre] = useState(dog?.padreNombre || '');
  const [madreNombre, setMadreNombre] = useState(dog?.madreNombre || '');
  const [abueloPaterno, setAbueloPaterno] = useState(dog?.abueloPaterno || '');
  const [abuelaPaterna, setAbuelaPaterna] = useState(dog?.abuelaPaterna || '');
  const [abueloMaterno, setAbueloMaterno] = useState(dog?.abueloMaterno || '');
  const [abuelaMaterna, setAbuelaMaterna] = useState(dog?.abuelaMaterna || '');

  // Great-grandparents (bisabuelos)
  const [bisabuelos, setBisabuelos] = useState<Ejemplar['bisabuelos']>(dog?.bisabuelos || {});

  const handleImportFromPedigreeDb = async () => {
    if (!pedigreeDatabaseUrl.trim()) return;
    setIsFetchingPedigreeDb(true);
    setPedigreeDbError(null);
    setPedigreeDbSuccess(null);
    try {
      const res = await parsePedigreeDatabaseUrl(pedigreeDatabaseUrl.trim());
      if (!res.success || !res.data) {
        setPedigreeDbError(res.error || 'No se pudo leer la información de PedigreeDatabase.com');
        return;
      }
      const data = res.data;
      if (data.nombre && (!nombreCompleto || nombreCompleto.trim() === '')) {
        setNombreCompleto(data.nombre);
      }
      if (data.sexo && (!dog || !nombreCompleto)) {
        setSexo(data.sexo);
      }
      if (data.fotoUrl && !fotoUrl) {
        setFotoUrl(data.fotoUrl);
      }
      if (data.padreNombre) setPadreNombre(data.padreNombre);
      if (data.madreNombre) setMadreNombre(data.madreNombre);
      if (data.abueloPaterno) setAbueloPaterno(data.abueloPaterno);
      if (data.abuelaPaterna) setAbuelaPaterna(data.abuelaPaterna);
      if (data.abueloMaterno) setAbueloMaterno(data.abueloMaterno);
      if (data.abuelaMaterna) setAbuelaMaterna(data.abuelaMaterna);
      if (data.bisabuelos) setBisabuelos(data.bisabuelos);

      setPedigreeDbSuccess(`¡Genealogía importada con éxito de "${data.nombre}"!`);
    } catch (err: any) {
      setPedigreeDbError('Error de conexión con PedigreeDatabase: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setIsFetchingPedigreeDb(false);
    }
  };

  // Health and POA
  const [calificacionCria, setCalificacionCria] = useState(dog?.calificacionCria || 'Seleccionado de Primera (Kkl 1)');
  const [displasiaCadera, setDisplasiaCadera] = useState<CalificacionDisplasiaCadera>(
    dog?.displasiaCadera || 'HD "a" Normal (Libre)'
  );
  const [displasiaCodo, setDisplasiaCodo] = useState<CalificacionDisplasiaCodo>(
    dog?.displasiaCodo || 'ED "0" Normal (Libre)'
  );
  const [adn, setAdn] = useState(dog?.adn || 'Comprobado (DNA gpr.)');
  const [titulosRaw, setTitulosRaw] = useState((dog?.titulos || []).join(', '));
  const [observaciones, setObservaciones] = useState(dog?.observaciones || '');

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const res = await uploadDogPhoto(file, nombreCompleto || 'ejemplar');
      setFotoUrl(res.url);
      setPhotoSource(res.source);
      setUploadSuccess(
        res.source === 'storage'
          ? '¡Fotografía subida a Firebase Storage exitosamente!'
          : '¡Fotografía procesada y almacenada en persistencia local!'
      );
    } catch (err: any) {
      setUploadError('Error al subir la imagen: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto.trim()) return;

    const titulos = titulosRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const data: Omit<Ejemplar, 'id' | 'createdAt'> = {
      criaderoId: currentCriaderoId,
      nombreCompleto,
      afijo,
      sexo,
      raza,
      fechaNacimiento,
      numeroPOA,
      microchip,
      tatuaje,
      identificacionInterna,
      color,
      pelo,
      estadoReproductivo,
      estado,
      fotoUrl,
      pedigreeDatabaseUrl: pedigreeDatabaseUrl.trim() || undefined,
      pedigreeDocUrl: pedigreeDocUrl || undefined,
      pedigreeDocNombre: pedigreeDocNombre || undefined,
      pedigreeDocTipo: pedigreeDocTipo || undefined,
      pedigreeDocSize: pedigreeDocSize || undefined,
      pedigreeDocFecha: pedigreeDocFecha || undefined,
      padreNombre,
      madreNombre,
      abueloPaterno,
      abuelaPaterna,
      abueloMaterno,
      abuelaMaterna,
      bisabuelos,
      calificacionCria,
      displasiaCadera,
      displasiaCodo,
      adn,
      titulos,
      observaciones,
    };

    if (dog) {
      updateEjemplar(dog.id, data);
    } else {
      addEjemplar(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {dog ? 'Editar Ejemplar' : 'Alta de Nuevo Ejemplar'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Criadero: {currentCriadero?.nombre} ({currentCriadero?.afijo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-4">
          <button
            type="button"
            onClick={() => setActiveFormTab('DATOS')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeFormTab === 'DATOS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1. Datos Principales
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('GENEALOGIA')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeFormTab === 'GENEALOGIA'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. Genealogía / Padres
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('SANIDAD')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeFormTab === 'SANIDAD'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Sanidad y POA
          </button>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* TAB 1: DATOS */}
          {activeFormTab === 'DATOS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="ej: Kaiser Von Der Balmaceda"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Afijo
                  </label>
                  <input
                    type="text"
                    value={afijo}
                    onChange={(e) => setAfijo(e.target.value)}
                    placeholder="ej: VON DER BALMACEDA"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sexo *</label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as Sexo)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="MACHO">MACHO</option>
                    <option value="HEMBRA">HEMBRA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Raza</label>
                  <input
                    type="text"
                    value={raza}
                    onChange={(e) => setRaza(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número POA</label>
                  <input
                    type="text"
                    value={numeroPOA}
                    onChange={(e) => setNumeroPOA(e.target.value)}
                    placeholder="POA-45892"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Microchip (15 dígitos)</label>
                  <input
                    type="text"
                    value={microchip}
                    onChange={(e) => setMicrochip(e.target.value)}
                    placeholder="981098104829101"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tatuaje POA</label>
                  <input
                    type="text"
                    value={tatuaje}
                    onChange={(e) => setTatuaje(e.target.value)}
                    placeholder="B-142"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color / Manto</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="ej: Negro y Fuego intenso"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Pelo</label>
                  <select
                    value={pelo}
                    onChange={(e) => setPelo(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="CORTO">Pelo Corto (Stockhaar)</option>
                    <option value="LARGO">Pelo Largo (Langstockhaar)</option>
                    <option value="MEDIO">Medio</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Reproductivo</label>
                  <select
                    value={estadoReproductivo}
                    onChange={(e) => setEstadoReproductivo(e.target.value as EstadoReproductivo)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_CELO">En Celo</option>
                    <option value="GESTANTE">Gestante</option>
                    <option value="EN_DESCANSO">En Descanso</option>
                    <option value="RETIRADO">Retirado</option>
                  </select>
                </div>
              </div>

              {/* PedigreeDatabase.com Integration Box */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Link PedigreeDatabase.com</span>
                  </label>
                  {pedigreeDatabaseUrl && (
                    <a
                      href={pedigreeDatabaseUrl.startsWith('http') ? pedigreeDatabaseUrl : `https://${pedigreeDatabaseUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Abrir en PedigreeDatabase</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={pedigreeDatabaseUrl}
                    onChange={(e) => {
                      setPedigreeDatabaseUrl(e.target.value);
                      setPedigreeDbError(null);
                      setPedigreeDbSuccess(null);
                    }}
                    placeholder="ej: https://www.pedigreedatabase.com/german_shepherd_dog/dog.html?id=2623348"
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs shadow-xs"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleImportFromPedigreeDb}
                      disabled={!pedigreeDatabaseUrl.trim() || isFetchingPedigreeDb}
                      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        !pedigreeDatabaseUrl.trim() || isFetchingPedigreeDb
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs'
                      }`}
                      title="Importar automáticamente nombre, foto y genealogía desde PedigreeDatabase"
                    >
                      {isFetchingPedigreeDb ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Importando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Importar Genealogía</span>
                        </>
                      )}
                    </button>
                    {pedigreeDatabaseUrl && (
                      <a
                        href={pedigreeDatabaseUrl.startsWith('http') ? pedigreeDatabaseUrl : `https://${pedigreeDatabaseUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors shadow-xs"
                        title="Abrir link en pestaña nueva"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Guardá el link oficial de este perro en PedigreeDatabase.com. Podés hacer clic en &quot;Importar Genealogía&quot; para autocompletar padres y abuelos.
                </p>

                {pedigreeDbSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{pedigreeDbSuccess}</span>
                  </div>
                )}

                {pedigreeDbError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{pedigreeDbError}</span>
                  </div>
                )}
              </div>

              {/* Photographic Asset / Firebase Storage Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Fotografía del Ejemplar (Firebase Storage)</span>
                  </label>
                  {photoSource === 'storage' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono font-bold text-[10px] flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      <span>Firebase Storage</span>
                    </span>
                  )}
                </div>

                {/* Upload Zone & Preview */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {fotoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={fotoUrl}
                        alt="Previsualización"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200 shadow-xs group-hover:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFotoUrl('');
                          setUploadSuccess(null);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                        title="Eliminar fotografía"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <span className="text-[10px] mt-1 font-mono">Sin foto</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <label
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                          isUploadingPhoto
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                            <span>Subiendo a Firebase Storage...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>{fotoUrl ? 'Reemplazar Fotografía' : 'Subir Foto a Firebase Storage'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowManualUrl((prev) => !prev)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                      >
                        {showManualUrl ? 'Ocultar URL' : 'O ingresar URL'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Formatos soportados: JPG, PNG, WebP. Las imágenes se optimizan y se almacenan directamente en tu bucket de Firebase Storage.
                    </p>

                    {/* Feedback Messages */}
                    {uploadSuccess && (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{uploadSuccess}</span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5">
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Manual URL Input */}
                {showManualUrl && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Enlace directo a imagen web (URL):
                    </label>
                    <input
                      type="url"
                      value={fotoUrl}
                      onChange={(e) => {
                        setFotoUrl(e.target.value);
                        setPhotoSource('external');
                      }}
                      placeholder="https://ejemplo.com/foto-pastor-aleman.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs shadow-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GENEALOGIA */}
          {activeFormTab === 'GENEALOGIA' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs">
                  Ingresá los nombres de los progenitores y abuelos para vincular el árbol genealógico de 4 generaciones y cálculo en el Simulador de Cruzas.
                </span>
                {pedigreeDatabaseUrl && (
                  <button
                    type="button"
                    onClick={handleImportFromPedigreeDb}
                    disabled={isFetchingPedigreeDb}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sincronizar con PDB</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-blue-700 uppercase text-[11px]">Línea Paterna</h4>
                  <div>
                    <label className="block text-slate-600 mb-1">Padre</label>
                    <input
                      type="text"
                      value={padreNombre}
                      onChange={(e) => setPadreNombre(e.target.value)}
                      placeholder="VA1 Gary vom Hühnegrab"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Abuelo Paterno</label>
                    <input
                      type="text"
                      value={abueloPaterno}
                      onChange={(e) => setAbueloPaterno(e.target.value)}
                      placeholder="2X VA1 Vegas du Haut Mansard"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Abuela Paterna</label>
                    <input
                      type="text"
                      value={abuelaPaterna}
                      onChange={(e) => setAbuelaPaterna(e.target.value)}
                      placeholder="V Patricia vom Hühnegrab"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-pink-700 uppercase text-[11px]">Línea Materna</h4>
                  <div>
                    <label className="block text-slate-600 mb-1">Madre</label>
                    <input
                      type="text"
                      value={madreNombre}
                      onChange={(e) => setMadreNombre(e.target.value)}
                      placeholder="V Cira von der Liebeswarte"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Abuelo Materno</label>
                    <input
                      type="text"
                      value={abueloMaterno}
                      onChange={(e) => setAbueloMaterno(e.target.value)}
                      placeholder="VA Omen v. Radhaus"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Abuela Materna</label>
                    <input
                      type="text"
                      value={abuelaMaterna}
                      onChange={(e) => setAbuelaMaterna(e.target.value)}
                      placeholder="V Xara del Plata"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Documento Oficial de Pedigree (PDF o Imagen) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Documento de Pedigree Oficial (PDF o Imagen)</span>
                  </h4>
                  {pedigreeDocUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {pedigreeDocTipo || 'Archivo cargado'}
                    </span>
                  )}
                </div>

                {pedigreeDocUrl ? (
                  <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <strong className="text-slate-900 text-xs truncate block font-bold">
                          {pedigreeDocNombre || 'pedigree-documento'}
                        </strong>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{pedigreeDocFecha || 'Reciente'}</span>
                          {pedigreeDocSize && (
                            <>
                              <span>•</span>
                              <span>{pedigreeDocSize}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={pedigreeDocUrl}
                        download={pedigreeDocNombre || 'pedigree.pdf'}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 cursor-pointer"
                        title="Descargar archivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setPedigreeDocUrl('');
                          setPedigreeDocNombre('');
                          setPedigreeDocTipo(undefined);
                          setPedigreeDocSize('');
                          setPedigreeDocFecha('');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="p-4 rounded-xl bg-white border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer text-center group shadow-2xs">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                    <span className="font-bold text-slate-700 text-xs">
                      Subir archivo de Pedigree (PDF o Imagen)
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Podés seleccionar un PDF o imagen escaneada del certificado de pedigree oficial
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setPedigreeDocUrl(ev.target.result as string);
                              setPedigreeDocNombre(file.name);
                              setPedigreeDocTipo(file.type.includes('pdf') ? 'PDF' : 'IMAGEN');
                              setPedigreeDocSize(`${(file.size / 1024).toFixed(0)} KB`);
                              setPedigreeDocFecha(new Date().toISOString().split('T')[0]);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SANIDAD Y POA */}
          {activeFormTab === 'SANIDAD' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Displasia de Cadera (HD)
                  </label>
                  <select
                    value={displasiaCadera}
                    onChange={(e) => setDisplasiaCadera(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value='HD "a" Normal (Libre)'>HD &quot;a&quot; Normal (Libre Oficial)</option>
                    <option value='HD "a" Casi Normal (Permitido)'>HD &quot;a&quot; Casi Normal (Permitido)</option>
                    <option value="HD Permitido (Grado I)">HD Permitido (Grado I)</option>
                    <option value="No Evaluado">No Evaluado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Displasia de Codo (ED)
                  </label>
                  <select
                    value={displasiaCodo}
                    onChange={(e) => setDisplasiaCodo(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value='ED "0" Normal (Libre)'>ED &quot;0&quot; Normal (Libre Oficial)</option>
                    <option value='ED "1" Casi Normal'>ED &quot;1&quot; Casi Normal</option>
                    <option value="ED Grado I">ED Grado I</option>
                    <option value="No Evaluado">No Evaluado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Calificación de Cría POA
                  </label>
                  <input
                    type="text"
                    value={calificacionCria}
                    onChange={(e) => setCalificacionCria(e.target.value)}
                    placeholder="Seleccionado de Primera (Kkl 1)"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ADN</label>
                  <input
                    type="text"
                    value={adn}
                    onChange={(e) => setAdn(e.target.value)}
                    placeholder="Comprobado (DNA gpr.)"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Títulos y Premios (separados por coma)
                </label>
                <input
                  type="text"
                  value={titulosRaw}
                  onChange={(e) => setTitulosRaw(e.target.value)}
                  placeholder="Sieger Argentino 2024, Campeón POA, VA1"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observaciones Generales
                </label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles de carácter, prueba de coraje, temperamento..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{dog ? 'Guardar Cambios' : 'Registrar Ejemplar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

