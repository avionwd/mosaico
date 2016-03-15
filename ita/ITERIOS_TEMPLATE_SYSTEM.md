# Общие положения

*Mosaico template* - шаблон Mosaico - набор блоков, из которых можно собрать тело рассылки

*Iterios template* - шаблон Iterios - заготовка тела рассылки с некоторым количеством вставленных в него блоков из набора Mosaico template

*Body template* - результат работы редактора Mosaico - заготовка тела рассылки с некоторым количеством вставленных в него блоков из набора Mosaico template


# Как Mosaico хранит заготовки тела рассылки
 
 Для сохранения результатов редактирования в Mosaico используется `localStorage`.
 
 Когда из какого-либо *Mosaico template* создается новая пустая *Body template*, ей присваивается уникальное имя, представляющее собой 7-значный хэш. 
 Это имя является ключем данного *Body template*. Оно добаляется в массив `edits` в `localStorage`.
 Также, в `localStorage` записываются мета-данные (ключ метаданных `metadata-NNNNNNN`, где *NNNNNN* - имя (ключ) данного *Body template*).
 После того, как мета-данные записаны в `localStorage`, вызывается редактор, которму передается только ключ. Остальные данные (в частности, используемый *Mosaico template*)
 редактор самостоятельно загружает из `localStorage`  по ключу.
  
При сохранении *Body template* в `localStorage` записываются JSON данные (ключ `template-NNNNNNN`, где *NNNNNN* - имя (ключ) данного *Body template*)

При вызове редактора с хэшем в URL, соответствующем имени (ключу) какого-либо из *Body template*, редактор читает в `localStorage` 
мета и JSON данные и загружает нужные *Mosaico template* и *Body template*.

# Шаблоны Iterios

Для того, чтобы предоставить клиенту редактор рассылки с неким уже частично заполненным *Body template*, мы используем 
заранее подготовленные *Body template*, которые хранятся отдельно. Это и есть *Iterios template*. 

Пользователю предлагается выбрать не просто набор блоков с пустым *Body template*, а какой-то из подготовленных нами
заранее *Iterios template*. Соответсвенно, результаты редактирования *Body template* пользователем сохраняются в текущей рассылке
и никак не влияют на исходный *Iterios template*.
 
Перед тем, как вызвать редактор для редактирования *Iterios template*, нужно записать в `localStorage` его метаданные подобно тому, как это
делается при создании нового *Body template*

 ```
    localStorage.setItem('metadata-KEY', { created: Date.now(), key: KEY, name: TPL_NAME_, template: TPL_FILE });  
    // KEY - ключ (7-значный хэш) *Body template*  
    // TPL_NAME - название *Mosaico template*  
    // TPL_FILE - файл *Mosaico template* (включая путь)  
 ```


# Что изменено в коде редактора
 
## Сохранение *Iterios template*
 
 Добавлена кнопка "Сохранить как шаблон"
 файл `\src\tmpl\main.tmpl.html` стр.39
 Обработчик кнопки `saveAsCmd`
 файл `\src\js\ext\localstorage.js` (необходима последующая сборка `grunt build`)
 
 
## Загрузка *Iterios template*
 
 В качестве признака *Iterios template* используется ключевое слово `tpl_` в хэше URL перед именем (ключем) *Body template*
 Обработчик загрузки шаблонов, встретив такой хэш, получает из него имя (ключ) и загружает *Iterios template*
 
 Обработчик загрузки *Iterios template* организован в файле `\src\js\app.js` (необходима последующая сборка `grunt build`)
 стр. 175 - определитель хэша `tpl_NNNNNNN` (NNNNNN* - имя (ключ) данного *Iterios template*)
 стр. 126 - получение мета и JSON данных и старт редактора.
 
# Стилизация
 
 В файле `\src\css\app_standalone_material.less` устанавливаем:
 
 ```
    @accent-color: #3B3F51;
    @background-color: #eeeeee;
    @link-color: #3fc9d5;
```

# Локализация

## Перевод редактора

Файлы перевода `mosaico-LL.json` (`LL` - код языка) расположены в папке `/res/lang`. Каждый из файлов содержит объект со строками перевода.

При инициализации редактора объект перевода указывается в параметре `strings` (см. `editor.php` line 32):

 ```
 var strings = $.ajax('res/lang/mosaico-ru.json', {type: "GET", async: false, dataType: 'json'}).responseJSON;
 var ok = Mosaico.init({
    strings: strings,
    // ...
 });
 ```
 
## Перевод шаблона
 
Для перевода дефиниций шаблона используется тот же `json` файл, что и для перевода редактора.
 
С этой целью в файле `src\js\app.js` переопределена функция перевода шаблона `viewModel.ut()` точно также, как переопределена функция перевода редактора `viewModel.t()`:
 
 ```
     vm.ut = function(category, key) {
         var res = options.strings[key];
         if (typeof res == 'undefined') {
             console.warn("Missing translation string for", key, ": using default string");
             res = key;
         }
         return res;
     };
 ``` 

Кроме того, в `json` файл перевода добавлены свойства для перевода дефиниций шаблона.

 
# Изображения
 
## Плейсхолдеры в шаблоне
 
Атрибут `srs` плейсхолдеров изображений в редакторе определяется функцией `ko.bindingHandlers.wysiwygSrc.placeholderUrl` в файле `src\js\app.js`
 
Для того, чтобы в качестве плейсхолдеров изображений в редакторе использовать ресурс `placehold.it` необходимо:

1. При инициализации редактора указать параметр `imgProcessorBackend`:

 ```
 var ok = Mosaico.init({
     imgProcessorBackend: 'http://placehold.it/',
     // ... остальные параметры
 }, plugins);
 ```
 
2. Переопределить функцию `ko.bindingHandlers.wysiwygSrc.placeholderUrl` в файле `src\js\app.js`:

 ```
   ko.bindingHandlers.wysiwygSrc.placeholderUrl = function(width, height, text) {
     return options.imgProcessorBackend +  width + 'x' + height;
   };
 ```



