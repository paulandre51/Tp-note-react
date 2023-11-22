import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState(null);
  const [profiles, setProfile] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const newNote = {
    id: 0,
    title: "Nouvelle note",
    body: "écrit ce que tu veux retenir ",
    date: new Date().toLocaleString(),
  };

  const onAddNote = async () => {
    let previousId = 0;

    if (notes.length > 0) {
      previousId = notes[notes.length - 1].id;
    }
    try {
      newNote.id = previousId + 1
      const resp = await fetch("/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (resp.ok) {
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        setCurrentIndex(updatedNotes.length - 1);
      }
    } catch (error) {

    }
  };

  const delnote = async () => {

    if (notes[currentIndex] == null) { return; }
    const confirmed = window.confirm("tu veux vraiment suppr ?");

    if (!confirmed) {
      return;
    }

    try {
      const resp = await fetch(`/notes/${notes[currentIndex].id}`, {
        method: "DELETE",
      });

      if (resp.ok) {
        const updatedNotes = notes.filter((_, index) => index !== currentIndex)
          .map((note, index) => ({ ...note, id: index + 1 }));

        setNotes(updatedNotes);

        if (updatedNotes.length > 0) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(null);
        }

        await fetch("/update-json", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedNotes),
        });
      }
    } catch (error) {
    }
  };
  const editnote = () => {
    if (notes[currentIndex] == null) { return; }
    setIsEditing(true);
    setEditedContent(notes[currentIndex].body);
    setEditedTitle(notes[currentIndex].title);
  };

  const clicknote = (id) => {
    setCurrentIndex(id - 1);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesResponse = await fetch("/notes");
        const notesData = await notesResponse.json();
        setNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes:", error.message);
      }
    };
  
    const fetchProfile = async () => {
      try {
        const profileResponse = await fetch("/profiles");
        const profileData = await profileResponse.json();
        setProfile(profileData.name);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      }
    };
  
    fetchNotes();
    fetchProfile();
  }, []);
  


  const savenote = async () => {
    const updatedNotes = [...notes];
    const updatedNote = { ...updatedNotes[currentIndex], body: editedContent, title: editedTitle };
    updatedNotes[currentIndex] = updatedNote;

    setNotes(updatedNotes);

    try {
      const resp = await fetch(`/notes/${updatedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNote),
      });

      if (resp.ok) {
        setIsEditing(false);
      }
    } catch (error) {
    }
  };

  return (
    <>
      <aside className="Side">
        <button onClick={onAddNote}>
          +
        </button>
        <div className="ProfileName">salut, {profiles}</div>
        {notes !== null
          ? notes.slice().reverse().map((note, index) => (
            <div key={index} onClick={() => clicknote(note.id)}>
              <div className="Titles">
                {note.title}
                <div className="Creation">{note.date}</div>
                <div className="Id">{note.id}</div>
              </div>
            </div>
          ))
          : null}
      </aside>

      <main className="Main">
        <div>
          {notes !== null ? (
            <div className="NotesContentTitle">
              {isEditing ? (
                <textarea
                  className="EditableTextTitle"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              ) : (
                (notes[currentIndex]?.title !== null && notes[currentIndex]?.title !== "")
                  ? notes[currentIndex]?.title
                  : null
              )}
            </div>
          ) : (
            null
          )}


        </div>
        <div>

          {notes !== null ? (
            <div className="NotesContent">
              {isEditing ? (
                <textarea
                  className="EditableTextArea"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              ) : (
                notes[currentIndex]?.body !== null
                  ? notes[currentIndex]?.body
                  : null
              )}
            </div>
          ) : (
            null
          )}

          {isEditing ? (
            <button onClick={savenote}>
              sauvegarder
            </button>
          ) : (
            <button onClick={editnote}>
              modifier
            </button>
          )}

          <button onClick={delnote}>
            suppr
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
