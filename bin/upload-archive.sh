#! /bin/bash

main() {
    local tarfile buckets bucket

    tarfile="$1"
    buckets=(
      s3://alces-flight-launch-wkxmogwyz-xrlouv1wwp0
      s3://alces-flight-nmi0ztdmyzm3ztm3
    )

    for bucket in ${buckets[@]} ; do
        echo "Uploading ${tarfile} to ${bucket}/misc/"
        aws s3 cp ${tarfile} "${bucket}/misc/"
    done
}

main "$@"
