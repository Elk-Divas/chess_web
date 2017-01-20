<?php
$myFile = "log.txt";
$fh = fopen($myFile, 'w') or die("can't open file");
$stringData = $_REQUEST['stack'];
echo $stringData;
fwrite($fh, $stringData);
fclose($fh);
?>
