import React, { useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { Person } from 'blockstack';
import M from "materialize-css";

import { appConfig, userSession, isUserSignedIn } from '../Shared/defaults';
import { fetchNotebookFile } from '../../store/actions/notesAction';
import { fetchTagsFile } from '../../store/actions/tagsAction';
import Navbar from '../Shared/Navbar';
import Loading from '../Shared/Loading';
import FloatingIcon from '../Shared/FloatingIcon';
import Footer from '../Shared/Footer';

function Dash() {
  // Get the Redux Dispatch
  const dispatch = useDispatch();

  // Get the Redux state
  const store = useSelector(store => store);
  const notes = store.notes;
  const notesData = notes.notesData;

  const tags = store.tags;
  const tagsData = tags.tagsData;

  useEffect(() => {
    if(isUserSignedIn && !notesData) dispatch(fetchNotebookFile(userSession));

    if(isUserSignedIn && !tagsData) dispatch(fetchTagsFile(userSession));

    if(isUserSignedIn && notesData) {
      document.addEventListener('keydown', keyboardShortcutsHandler);

      return () => {
        document.removeEventListener('keydown', keyboardShortcutsHandler);
      }
    }
  }, [notesData, tagsData]);

  useEffect(() => {
    if(isUserSignedIn && notesData && tagsData) {
      const elems = document.querySelectorAll('.autocomplete');
      const options = {
        data: {}
      };
      tagsData.forEach((tD) => {
        options.data[tD.name] = null;
      });
      const instances = M.Autocomplete.init(elems, options);
    }
  }, [notesData, tagsData]);

  const keyboardShortcutsHandler = (e) => {
    if(e.key < 1 && e.key > 9) {
      return;
    }

    if((e.key > 0 && e.key < 10) && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const dncIndex = document.querySelector(`.dnc-${e.key}`);
  
      if(dncIndex) dncIndex.click();
    }
  };

  if(!isUserSignedIn) {
    return <Redirect to="/login" />;
  }

  const userData = userSession.loadUserData();
  const userProfile = new Person(userData.profile);
  const username = userData.username;
  const usernameorFullName = userProfile.name() ? userProfile.name() : username;
  const userAvatarURL = userProfile.avatarUrl() ? userProfile.avatarUrl() : `${appConfig.appDomain}/icons/avatar.png`;

  const NotesLoading = notes.isFetching;

  return(
    <>
      <Navbar />

      <section className="container center-align mt-3rem">
        <div>
          <h2>Dashboard</h2>
        </div>

        <div>
          <img src={ userAvatarURL } alt="my avatar" className="profile-avatar" />
          <p className="fs-1-2 bold">Welcome, { usernameorFullName }!</p>
          <a href="https://browser.blockstack.org/profiles" target="_blank" rel="noopener noreferrer" className="btn forest-green-btn">
            Edit Profile
            <i className="material-icons right">edit</i>
          </a>
        </div>
      </section>

      <div className="container">
        <hr />
      </div>

      <section className="container mb-10rem">
        {
          NotesLoading ? (
            <Loading />
          ) : (
            <>
              <div className="center-align">
                <h2>Your notes</h2>
              </div>

              {
                notesData.length === 0 ? (
                  <div className="row">
                    <div className="col m6 offset-m3 s12">
                      <p className="fs-1-1">It's lonely over here, start writing a new note by click on + icon from bottom right...</p>
                      <img src="/notga/images/illustrations/lonely.svg" alt="lonely illustration" className="responsive-img" />
                    </div>
                  </div>
                ) : (<></>)
              }

              <div className="row mt-2rem dash-notes">
                {
                  notesData && notesData.map((note, index) => {
                    return(
                      <div key={note.id} className="col s12 m4">
                        <Link to={ "/show/" + note.id } className={ "dash-notes-card center-align dnc-" + (index + 1) }>
                          <p className="fs-1-1 bold uppercase">{ note.title }</p>
                        </Link>
                      </div>
                    );
                  })
                }
                
              </div>
            </>
          )
        }
      </section>

      <FloatingIcon />

      <Footer />
    </>
  );
};

export default Dash;