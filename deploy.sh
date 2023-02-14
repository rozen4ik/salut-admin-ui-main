#!/bin/zsh
sshAddress=root@92.63.100.34
remotePath=/var/www/www-root/data/www/salut-test.computerica.ru/
archiveName=build.tgz

npm run build
tar czvf $archiveName -C build .
scp $archiveName $sshAddress:$remotePath
rm $archiveName
ssh $sshAddress "(cd $remotePath && tar xzvf $archiveName && rm $archiveName)"

exit 0
