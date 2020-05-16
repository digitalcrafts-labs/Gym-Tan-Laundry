var selectPlaylist = document.getElementById('selectPlaylist');
var selectPlaylistSize = document.querySelectorAll('input[name="songList"]');
var submitPlaylistBtn = document.getElementById('playlistSubmitButton');

submitPlaylistBtn.addEventListener('click', function() {
    console.log(selectPlaylist.value);

    for(var i = 0; i < selectPlaylistSize.length; i++) {
        if(selectPlaylistSize[i].checked) {
            console.log(selectPlaylistSize[i].value);
        }
    }
})

