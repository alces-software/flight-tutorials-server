#! /bin/bash

abort_unless_client_files_are_present() {
    if [ $( ls -1 public/static | wc -l ) -eq 0 ] ; then
        echo "Symlink (or copy) client files to public/static directory"
        exit 1
    fi
}

usage() {
    echo "Usage: $(basename $0) [options]"
    echo
    echo "Create archive for flight tutorials server"
    echo
    echo -e "      --local\t\tCreate an archive from the git repo"
    echo -e "      --remote\t\tCreate an archive from a deployment to a flight compute node"
    echo -e "      --help\t\tShow this help message"
}

create_local_archive() {
    local tarfile

    abort_unless_client_files_are_present

    tarfile=$(mktemp)

    tar czf ${tarfile} \
        --transform "s/^\.\//tutorial\//" \
        --dereference  \
        --exclude .git \
        --exclude tutorial.tar.gz \
        --owner root \
        --group alces \
        .
    mv ${tarfile} tutorial.tar.gz

    echo "Archive available at ./tutorial.tar.gz"
}

create_remote_archive() {
    tar -C /opt \
        -czf /opt/tutorial.tar.gz \
        --exclude server.log \
        tutorial

    echo "Archive available at /opt/tutorial.tar.gz"
}

main() {
    case "$1" in
        --local)
            create_local_archive
            ;;
        --remote)
            create_remote_archive
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            usage
            exit 1
            ;;
    esac
}

main "$@"
