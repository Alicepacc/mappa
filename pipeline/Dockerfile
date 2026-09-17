# syntax=docker/dockerfile:1
#
# Pipeline toolchain (SPEC §3): one image carrying every binary the data build
# needs, so a contributor only needs Docker. Versions are pinned so a build is
# reproducible and recorded in data/manifest.json.
#
# Finalised in M1 — the versions below are the current stable releases at the
# time of the M0 audit and are re-verified when the steps are implemented.

FROM ghcr.io/osgeo/gdal:ubuntu-small-3.11.0

ARG DEBIAN_FRONTEND=noninteractive
ARG PLANETILER_VERSION=0.10.1
ARG TIPPECANOE_VERSION=2.78.0

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git jq make unzip zip bzip2 pbzip2 \
      osmium-tool osmctools \
      openjdk-21-jre-headless \
      build-essential libsqlite3-dev zlib1g-dev \
      nodejs npm \
 && rm -rf /var/lib/apt/lists/*

# tippecanoe has no Debian package; build the pinned tag.
RUN git clone --depth 1 --branch ${TIPPECANOE_VERSION} \
      https://github.com/felt/tippecanoe.git /tmp/tippecanoe \
 && make -C /tmp/tippecanoe -j"$(nproc)" \
 && make -C /tmp/tippecanoe install \
 && rm -rf /tmp/tippecanoe

# Planetiler ships as a single jar.
RUN curl -fsSL -o /opt/planetiler.jar \
      https://github.com/onthegomap/planetiler/releases/download/v${PLANETILER_VERSION}/planetiler.jar
ENV PLANETILER_JAR=/opt/planetiler.jar

RUN corepack enable

WORKDIR /repo/pipeline
CMD ["bash"]
