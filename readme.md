<h2>Используемые технологии:</h2>
<ul>
    <li>Node.js</li>
    <li>Gulp</li>
    <li>Autoprefixer</li>
    <li>SASS</li>
    <li>Jade</li>
</ul>
<p>А так же небольшой скрипт для создания bem блоков</p>
<h2>Как установить:</h2>
<p>
    Вам потребуется <a href="https://nodejs.org/en/download/" target="_blank">NodeJS</a> и пользователям Windows обязательно <a href="https://git-for-windows.github.io/" target="_blank">GIT Bash</a>, код исполняется корректно только в нём.<br>
    После установки вешеописанного ПО, в GIT Bash переходите в деррикторию проекта и выполняете установку необходимых пакетов:
    <code>npm i</code>
    После чего запускаете gulp, командой <code>gulp</code> в консоли.
</p>
<h2>Как пользоваться:</h2>
Gulp автоматически собирает для вас спрайты, бандлы и минимизирует ваш код.<br>
Работайте только в дериктории src <br>
<h3>Описание дерикторий:</h3>
<code>src/blocks</code> - Хранение подключаемых блоков по методологии bem. <br>
png, jpg, svg, изображения собираются в спрайты в папку <code>src/img</code> в файлы <code>sprite.png sprite.jpg  sprite.svg</code> соответственно <br>
<code>src/font</code> - Хранение шрифтов, с ними ничего не происходит, они просто переносятся в dist <br>
<code></code>