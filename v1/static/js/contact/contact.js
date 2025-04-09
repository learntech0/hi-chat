target_user = url.searchParams.get('user_id');

if (!target_user) {
    function handleMediaQuery(mq) {
        var conversationDefaultSm = document.querySelector('.conversation-default.sm');
        if (mq.matches) {
            conversationDefaultSm.style.display = 'flex';
        } else {
            conversationDefaultSm.style.display = 'none';
        }
    }
    var mediaQuery = window.matchMedia('(max-width: 767px)');
    handleMediaQuery(mediaQuery);
    mediaQuery.addListener(handleMediaQuery);
}