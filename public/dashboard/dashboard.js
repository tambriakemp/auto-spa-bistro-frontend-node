let STATE = {};
// All these modules are are defined in /public/utilities
const HTTP = window.HTTP_MODULE;
const CACHE = window.CACHE_MODULE;

$(document).ready(onReady);

function onReady() {

    STATE.authUser = CACHE.getAuthenticatedUserFromCache();
    pastSubmittedTestimonies();

    $('body').on('click', '#logout-btn', onLogoutBtnClick);
    $('#testimony-form').on('submit', onCreateSubmit);
    $('body').on('click', '#delete-testimony', onDeleteTestimony);
    $('body').on('click', '#edit-testimony', onEditTestimony);
    $('body').on('submit', '#testimony-edit-form', onSubmitEditTestimony);
    loggedinUser();

}

// LOGOUT USER BUTTON ==========================================
function onLogoutBtnClick(event) {
    const confirmation = confirm('Are you sure you want to logout?');
    if (confirmation) {
        CACHE.deleteAuthenticatedUserFromCache();
        window.open('/', '_self');
    }
}

// LOGGED IN USER ==========================================
function loggedinUser() {
    $('.loggedin-user').append(`Welcome ${STATE.authUser.name}!`)
}

// SUBMIT NEW TESTIMONY ==========================================
function onCreateSubmit(event) {
    event.preventDefault();
    const newTestimony = {
        userTestimony: $('#userTestimony').val(),
        userDisplayName: $('#userDisplayName').val()
    };

    console.log(newTestimony);
    HTTP.createTestimony({
        authToken: STATE.authUser.authToken,
        newTestimony: newTestimony,
        onSuccess: testimony => {
            $('.notification').html(`Testimony submitted successfully`);
        },
        onError: err => {
            $('.notification').html(`ERROR: Testimony was not submitted successfully`);
        }
    });
    console.log('creating testimony')
}

// PAST SUBMITTED TESTIMONIES ==========================================
function pastSubmittedTestimonies(event) {
    const testimonies = HTTP.getUserTestimonies(
        {
            authToken: STATE.authUser.authToken,
            onSuccess: function (data) {
                console.log('dashboard list');
                console.log(data);

                for (let i = 0; i < data.length; i++) {
                    $('.testimony-list').append(`

              <tr id="user-testimony" data-note-id="${data[i].id}">
                  <td class="user-edit-testimony">${data[i].userTestimony}</td>
                  <td class="user-display-name">${data[i].userDisplayName}</td>
                  <td><a href id="edit-testimony"><img class="icon" src="/images/pencil.svg"></a></td> 
                  <td><a href id="delete-testimony"><img class="icon" src="/images/trash.svg"></a></td>
              </tr>
          `)
                }
            },
            onError: function () {
                console.log('error')
            }
        }
    );
}

// EDIT TESTIMONY ==========================================
function onEditTestimony(event) {
    event.preventDefault();
    console.log('edit testimony')

    const testimonyID = $(event.currentTarget)
        .parent().parent().attr('data-note-id')

    const userEditTestimony = $(event.currentTarget)
        .parent().parent().children('.user-edit-testimony').text()

    const userDisplayName = $(event.currentTarget)
        .parent().parent().children('.user-display-name').text()


    console.log(testimonyID, userEditTestimony, userDisplayName)
    //scroll to top table
    $('.user-testimony-forms').html(`
            <form id="testimony-edit-form" data-note-id="${testimonyID}">
            <textarea name="userTestimony" id="userTestimony">${userEditTestimony}</textarea>
            <input type="text" id="userDisplayName" name="userDisplayName" value="${userDisplayName}" placeholder="Choose Display Name">
            <input type="submit" value="Edit Testimony">
            </form>`)

}

// SUBMIT EDIT TESTIMONY ==========================================
function onSubmitEditTestimony(event) {
    event.preventDefault();
    console.log('on submit edit testimony');

    const updateTestimony = {
        userTestimony: $('#userTestimony').val(),
        userDisplayName: $('#userDisplayName').val(),
        testimonyID: $(event.target).attr('data-note-id')
    };

    HTTP.updateTestimony({
        testimonyID: updateTestimony.testimonyID,
        authToken: STATE.authUser.authToken,
        updateTestimony: updateTestimony,
        onSuccess: testimony => {
            $('.notification').html(`Testimony submitted successfully`);
        },
        onError: err => {
            $('.notification').html(`ERROR: Testimony was not submitted successfully`);
        }
    });

    $('.user-testimony-forms').html(`
    <form id="testimony-form">
    <textarea name="userTestimony" id="userTestimony"></textarea>
    <input type="userDisplayName" id="userDisplayName" name="userDisplayName" placeholder="Choose Display Name">
    <input type="submit">
    </form>`)
}

// DELETE TESTIMONY ==========================================

function onDeleteTestimony(event) {
    /**
   * Because "onNoteDeleteClick" and "onNoteClick" both are listening for clicks inside of
   * #note-card element, we need to call event.stopImmediatePropagation to avoid both
   * event listeners firing when we click on the delete button inside #note-card.
   */
    //   console.log(data[i].id);

    event.preventDefault();

    // event.stopImmediatePropagation();
    // Step 1: Get the note id to delete from it's parent.
    const testimonyID = $(event.currentTarget)
        .parent().parent()
        .attr('data-note-id');
    // Step 2: Verify use is sure of deletion
    const userSaidYes = confirm('Are you sure you want to delete this note?');
    if (userSaidYes) {
        // Step 3: Make ajax call to delete note
        HTTP.deleteTestimony({
            testimonyID: testimonyID,
            authToken: STATE.authUser.authToken,
            onSuccess: function () {
                location.reload();
                // Step 4: If succesful, reload the notes list
                // alert('Note deleted succesfully, reloading results ...');
                // HTTP.getUserTestimonies({
                //     authToken: STATE.authUser.authToken

                // });

            }
        });
    }
}
