import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Fab,
  Zoom,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Mic,
  Stop,
  CameraAlt,
  Add,
  Save,
  Search,
  Delete,
  Close,
  ExpandMore,
  ExpandLess,
  Email
} from '@mui/icons-material';

// Couleurs Safe HDF
const COLORS = {
  primary: '#7a1f20',
  background: '#000000',
  card: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  success: '#4caf50',
  error: '#f44336',
  recording: '#ff4444'
};

function PriseDeCote() {
  // États
  const [fiches, setFiches] = useState([]);
  const [modeCreation, setModeCreation] = useState(false);
  const [modeConsultation, setModeConsultation] = useState(false);
  const [ficheActive, setFicheActive] = useState(null);
  
  // Formulaire
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [photos, setPhotos] = useState([]);
  const [cotes, setCotes] = useState('');
  const [notes, setNotes] = useState('');
  
  // Dictée vocale
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiches, setFilteredFiches] = useState([]);
  
  // Envoi email
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Charger les fiches au démarrage
  useEffect(() => {
    loadFiches();
  }, []);

  // Filtrer les fiches
  useEffect(() => {
    if (searchTerm) {
      const filtered = fiches.filter(f => 
        f.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.modele.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiches(filtered);
    } else {
      setFilteredFiches(fiches);
    }
  }, [searchTerm, fiches]);

  const loadFiches = async () => {
    try {
      const response = await fetch('https://n8n.superprojetx.com/webhook/safeapp-cotes-list');
      if (response.ok) {
        const data = await response.json();
        setFiches(data.fiches || []);
      }
    } catch (error) {
      console.error('Erreur chargement fiches:', error);
    }
  };

  // Gestion photos
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, { preview: reader.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Dictée vocale
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Impossible d\'accéder au micro. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setTranscriptionLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('https://n8n.superprojetx.com/webhook/safeapp-transcribe', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setCotes(prev => prev ? prev + '\n' + data.text : data.text);
        }
      }
    } catch (error) {
      console.error('Erreur transcription:', error);
    } finally {
      setTranscriptionLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sauvegarde
  const saveFiche = async () => {
    if (!marque || !modele) {
      alert('Veuillez renseigner la marque et le modèle');
      return;
    }

    try {
      // Upload des photos d'abord
      const photoUrls = [];
      for (const photo of photos) {
        if (photo.file) {
          const formData = new FormData();
          formData.append('file', photo.file);
          formData.append('marque', marque);
          formData.append('modele', modele);

          const uploadRes = await fetch('https://n8n.superprojetx.com/webhook/safeapp-upload-photo', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            photoUrls.push(uploadData.url);
          }
        } else {
          photoUrls.push(photo.preview);
        }
      }

      // Sauvegarder la fiche
      const ficheData = {
        id: ficheActive?.id || Date.now().toString(),
        marque,
        modele,
        photos: photoUrls,
        cotes,
        notes,
        dateCreation: ficheActive?.dateCreation || new Date().toISOString(),
        dateModification: new Date().toISOString()
      };

      const response = await fetch('https://n8n.superprojetx.com/webhook/safeapp-cotes-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ficheData)
      });

      if (response.ok) {
        await loadFiches();
        resetForm();
        setModeCreation(false);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setMarque('');
    setModele('');
    setPhotos([]);
    setCotes('');
    setNotes('');
    setFicheActive(null);
  };

  const editFiche = (fiche) => {
    setFicheActive(fiche);
    setMarque(fiche.marque);
    setModele(fiche.modele);
    setPhotos(fiche.photos.map(url => ({ preview: url })));
    setCotes(fiche.cotes || '');
    setNotes(fiche.notes || '');
    setModeCreation(true);
    setModeConsultation(false);
  };

  const deleteFiche = async (id) => {
    if (confirm('Supprimer cette fiche ?')) {
      try {
        await fetch(`https://n8n.superprojetx.com/webhook/safeapp-cotes-delete?id=${id}`, {
          method: 'DELETE'
        });
        await loadFiches();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const sendEmail = async () => {
    if (!ficheActive) return;
    
    setSendingEmail(true);
    setEmailSent(false);
    
    try {
      const response = await fetch('https://n8n.superprojetx.com/webhook/safeapp-send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'contact@safehdf.com',
          fiche: ficheActive
        })
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        alert('Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 'bold', mb: 1 }}>
          🎯 Prise de Côte - Coffres-Forts
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          Centralisez vos photos et cotes avec dictée vocale
        </Typography>
      </Box>

      {/* Mode Liste */}
      {!modeCreation && !modeConsultation && (
        <>
          {/* Barre de recherche */}
          <TextField
            fullWidth
            placeholder="Rechercher une marque ou modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiInputBase-root': { bgcolor: COLORS.card, color: COLORS.text },
              '& .MuiInputBase-input': { color: COLORS.text }
            }}
            InputProps={{
              startAdornment: <Search sx={{ color: COLORS.textSecondary, mr: 1 }} />
            }}
          />

          {/* Liste des fiches */}
          {filteredFiches.length === 0 ? (
            <Alert severity="info" sx={{ bgcolor: COLORS.card, color: COLORS.text }}>
              Aucune fiche enregistrée. Commencez par créer une nouvelle fiche !
            </Alert>
          ) : (
            <List>
              {filteredFiches.map((fiche) => (
                <Card key={fiche.id} sx={{ bgcolor: COLORS.card, mb: 2 }}>
                  <ListItemButton onClick={() => { setFicheActive(fiche); setModeConsultation(true); }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ color: COLORS.text }}>
                          {fiche.marque} - {fiche.modele}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          {fiche.photos?.length || 0} photo(s) • {new Date(fiche.dateCreation).toLocaleDateString('fr-FR')}
                        </Typography>
                      }
                    />
                    <IconButton onClick={(e) => { e.stopPropagation(); editFiche(fiche); }} sx={{ color: COLORS.primary }}>
                      <ExpandMore />
                    </IconButton>
                    <IconButton onClick={(e) => { e.stopPropagation(); deleteFiche(fiche.id); }} sx={{ color: COLORS.error }}>
                      <Delete />
                    </IconButton>
                  </ListItemButton>
                </Card>
              ))}
            </List>
          )}

          {/* Bouton Ajouter */}
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: COLORS.primary }}
            onClick={() => setModeCreation(true)}
          >
            <Add />
          </Fab>
        </>
      )}

      {/* Mode Création/Édition */}
      {modeCreation && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: COLORS.text }}>
              {ficheActive ? 'Modifier la fiche' : 'Nouvelle fiche'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => { resetForm(); setModeCreation(false); }}
              sx={{ color: COLORS.text, borderColor: COLORS.textSecondary }}
            >
              Annuler
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Infos de base */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marque"
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-root': { bgcolor: COLORS.card },
                  '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                  '& .MuiInputBase-input': { color: COLORS.text }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modèle"
                value={modele}
                onChange={(e) => setModele(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-root': { bgcolor: COLORS.card },
                  '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                  '& .MuiInputBase-input': { color: COLORS.text }
                }}
              />
            </Grid>

            {/* Photos */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.card, mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.text, mb: 2 }}>
                    📸 Photos
                  </Typography>
                  
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CameraAlt />}
                    sx={{ bgcolor: COLORS.primary, mb: 2 }}
                  >
                    Ajouter des photos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>

                  {photos.length > 0 && (
                    <ImageList cols={3} rowHeight={120}>
                      {photos.map((photo, index) => (
                        <ImageListItem key={index} sx={{ position: 'relative' }}>
                          <img
                            src={photo.preview}
                            alt={`Photo ${index + 1}`}
                            style={{ height: '100%', objectFit: 'cover', borderRadius: 8 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removePhoto(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: COLORS.error,
                              color: '#fff',
                              '&:hover': { bgcolor: '#d32f2f' }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Dictée vocale */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.card, mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.text, mb: 2 }}>
                    🎤 Cotes (dictée vocale)
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={isRecording ? stopRecording : startRecording}
                      startIcon={isRecording ? <Stop /> : <Mic />}
                      sx={{
                        bgcolor: isRecording ? COLORS.recording : COLORS.primary,
                        '&:hover': { bgcolor: isRecording ? '#d32f2f' : '#5a1516' }
                      }}
                    >
                      {isRecording ? `Arrêter (${formatTime(recordingTime)})` : 'Dictée vocale'}
                    </Button>

                    {transcriptionLoading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: COLORS.primary }} />
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          Transcription en cours...
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Position perçage: ...&#10;Emplacement pênes: ...&#10;Épaisseur porte: ...&#10;Délateur: ..."
                    value={cotes}
                    onChange={(e) => setCotes(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: '#2a2a2a' },
                      '& .MuiInputBase-input': { color: COLORS.text, fontFamily: 'monospace' }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Notes complémentaires */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes complémentaires"
                placeholder="Astuces, difficultés rencontrées, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: COLORS.card },
                  '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                  '& .MuiInputBase-input': { color: COLORS.text }
                }}
              />
            </Grid>

            {/* Bouton Sauvegarder */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={saveFiche}
                sx={{
                  bgcolor: COLORS.success,
                  py: 2,
                  '&:hover': { bgcolor: '#388e3c' }
                }}
              >
                Sauvegarder la fiche
              </Button>
            </Grid>
          </Grid>
        </>
      )}

      {/* Mode Consultation */}
      <Dialog
        open={modeConsultation}
        onClose={() => setModeConsultation(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.card, color: COLORS.text } }}
      >
        {ficheActive && (
          <>
            <DialogTitle sx={{ color: COLORS.primary }}>
              {ficheActive.marque} - {ficheActive.modele}
            </DialogTitle>
            <DialogContent>
              {ficheActive.photos?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Photos</Typography>
                  <ImageList cols={2} rowHeight={200}>
                    {ficheActive.photos.map((url, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          style={{ borderRadius: 8, cursor: 'pointer' }}
                          onClick={() => window.open(url, '_blank')}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {ficheActive.cotes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Cotes</Typography>
                  <Box sx={{ bgcolor: '#2a2a2a', p: 2, borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {ficheActive.cotes}
                  </Box>
                </Box>
              )}

              {ficheActive.notes && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>Notes</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textSecondary }}>
                    {ficheActive.notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setModeConsultation(false)} sx={{ color: COLORS.text }}>
                Fermer
              </Button>
              <Button 
                onClick={() => { setModeConsultation(false); editFiche(ficheActive); }}
                sx={{ color: COLORS.primary }}
              >
                Modifier
              </Button>
              <Button 
                onClick={sendEmail}
                disabled={sendingEmail}
                startIcon={sendingEmail ? <CircularProgress size={16} /> : <Email />}
                sx={{ 
                  color: emailSent ? COLORS.success : COLORS.primary,
                  bgcolor: emailSent ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                }}
              >
                {emailSent ? 'Email envoyé !' : sendingEmail ? 'Envoi...' : 'Envoyer par email'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default PriseDeCote;
